import type { PDFDocument } from '@cantoo/pdf-lib';
import { revokeObjectUrlSafely, wipeInternalBuffer } from './pdfByteUtils';

export interface TrackedPdfSessionRecord {
  sessionId: string;
  fileName: string;
  createdAtMs: number;
  byteLength: number;
  disposed: boolean;
}

interface InternalSessionState extends TrackedPdfSessionRecord {
  isolatedBytes: Uint8Array | null;
  document: PDFDocument | null;
  objectUrls: Set<string>;
  customCleanups: Array<() => Promise<void> | void>;
}

/**
 * Module E — PDF Document Lifecycle Manager
 *
 * Tracks loaded PDF documents, isolated byte buffers, and temporary Object URLs.
 * Ensures:
 * 1. Caller-owned buffers are never mutated.
 * 2. Internal cloned buffers and document references are nulled and wiped on disposal.
 * 3. Active session counts can be inspected and deterministically cleaned up.
 */
class PdfLifecycleRegistry {
  private readonly sessions = new Map<string, InternalSessionState>();
  private counter = 0;

  public registerSession(params: {
    fileName?: string;
    isolatedBytes: Uint8Array;
    document?: PDFDocument;
  }): {
    sessionId: string;
    registerObjectUrl: (url: string) => void;
    registerCleanupCallback: (cb: () => Promise<void> | void) => void;
    dispose: () => Promise<void>;
  } {
    this.counter += 1;
    const sessionId = `pdf-v2-session-${Date.now()}-${this.counter}`;

    const state: InternalSessionState = {
      sessionId,
      fileName: params.fileName || 'document.pdf',
      createdAtMs: Date.now(),
      byteLength: params.isolatedBytes.byteLength,
      disposed: false,
      isolatedBytes: params.isolatedBytes,
      document: params.document || null,
      objectUrls: new Set<string>(),
      customCleanups: [],
    };

    this.sessions.set(sessionId, state);

    const dispose = async (): Promise<void> => {
      await this.disposeSession(sessionId);
    };

    return {
      sessionId,
      registerObjectUrl: (url: string) => {
        if (!state.disposed && url) {
          state.objectUrls.add(url);
        }
      },
      registerCleanupCallback: (cb: () => Promise<void> | void) => {
        if (!state.disposed) {
          state.customCleanups.push(cb);
        }
      },
      dispose,
    };
  }

  public async disposeSession(sessionId: string): Promise<boolean> {
    const state = this.sessions.get(sessionId);
    if (!state) return false;
    if (state.disposed) {
      this.sessions.delete(sessionId);
      return true;
    }

    state.disposed = true;

    // 1. Run registered cleanup callbacks (e.g. PDF.js document/page cleanup)
    for (const cb of state.customCleanups) {
      try {
        await cb();
      } catch {
        // Ignore cleanup callback errors
      }
    }
    state.customCleanups.length = 0;

    // 2. Revoke any tracked Object URLs
    for (const url of state.objectUrls) {
      revokeObjectUrlSafely(url);
    }
    state.objectUrls.clear();

    // 3. Wipe and release internal cloned byte buffer
    if (state.isolatedBytes) {
      wipeInternalBuffer(state.isolatedBytes);
      state.isolatedBytes = null;
    }

    // 4. Release PDFDocument reference
    state.document = null;
    this.sessions.delete(sessionId);
    return true;
  }

  public async disposeAllSessions(): Promise<number> {
    const ids = Array.from(this.sessions.keys());
    for (const id of ids) {
      await this.disposeSession(id);
    }
    return ids.length;
  }

  public getActiveSessionCount(): number {
    return this.sessions.size;
  }

  public getActiveTotalBytes(): number {
    let total = 0;
    for (const s of this.sessions.values()) {
      if (!s.disposed) {
        total += s.byteLength;
      }
    }
    return total;
  }

  public listActiveSessions(): TrackedPdfSessionRecord[] {
    return Array.from(this.sessions.values()).map((s) => ({
      sessionId: s.sessionId,
      fileName: s.fileName,
      createdAtMs: s.createdAtMs,
      byteLength: s.byteLength,
      disposed: s.disposed,
    }));
  }

  public isSessionActive(sessionId: string): boolean {
    const s = this.sessions.get(sessionId);
    return Boolean(s && !s.disposed);
  }
}

export const pdfLifecycleManager = new PdfLifecycleRegistry();
