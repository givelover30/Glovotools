import React from 'react';

interface AppShellProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  footer: React.ReactNode;
  readingProgress?: React.ReactNode;
  skipLabel: string;
  children: React.ReactNode;
}

/**
 * CALCTOOLS 2.0 Global Hybrid Application Shell
 * Combines a compact sticky top bar, collapsible persistent desktop left sidebar
 * (with mobile drawer mode), contextual breadcrumbs, main workspace viewport, and footer
 * without introducing nested vertical scroll traps on the primary content canvas.
 */
export default function AppShell({
  header,
  sidebar,
  breadcrumbs,
  footer,
  readingProgress,
  skipLabel,
  children
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 overflow-x-clip">
      {/* Keyboard Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2.5 focus:left-2.5 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-action-primary focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        {skipLabel}
      </a>

      {readingProgress}

      {/* Top Application Header (Sticky, Full Width) */}
      {header}

      {/* Hybrid Workspace Row: Collapsible Left Rail + Fluid Main Content Column */}
      <div className="flex-1 flex items-stretch min-w-0 w-full">
        {sidebar}

        <div className="flex-1 min-w-0 flex flex-col">
          {breadcrumbs}

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 focus:outline-none"
          >
            {children}
          </main>

          {footer}
        </div>
      </div>
    </div>
  );
}
