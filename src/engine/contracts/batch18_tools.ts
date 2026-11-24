import { CalculationContract, CalculationError } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH18_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Word & Character Counter
  {
    id: 'word-character-counter',
    name: 'Word, Character & Reading Time Counter',
    category: 'tools',
    subcategoryId: 'tools-text',
    formulaMeta: {
      formulaName: 'Text Density & Reading Duration Metric',
      formulaExpression: 'Words = count(tokens); ReadingTime = Words / 200 wpm; SpeakingTime = Words / 130 wpm',
      variables: [
        { symbol: 'W', name: 'Word Count' },
        { symbol: 'C', name: 'Total Characters' },
        { symbol: 'T_read', name: 'Reading Time (minutes)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'wordCount', label: 'Word Count', type: 'integer', required: true, defaultValue: 250, min: 0 },
        { name: 'readingSpeed', label: 'Reading Speed (WPM)', type: 'integer', required: true, defaultValue: 200, min: 50, max: 800 }
      ]
    },
    validate: (inputs: { wordCount: number; readingSpeed: number }): CalculationError[] => {
      if (typeof inputs.wordCount !== 'number' || isNaN(inputs.wordCount) || inputs.wordCount < 0) {
        return [{ field: 'wordCount', code: 'NON_NEGATIVE_REQUIRED', message: 'Word count must be a non-negative number' }];
      }
      if (typeof inputs.readingSpeed !== 'number' || isNaN(inputs.readingSpeed) || inputs.readingSpeed <= 0) {
        return [{ field: 'readingSpeed', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Reading speed must be positive' }];
      }
      return [];
    },
    calculate: (inputs: { wordCount: number; readingSpeed: number }) => {
      const words = Math.max(0, inputs.wordCount ?? 250);
      const wpm = inputs.readingSpeed ?? 200;
      const readingMinutes = words / wpm;
      const speakingMinutes = words / 130;
      const estimatedChars = Math.round(words * 5.5);
      const estimatedSentences = Math.max(1, Math.round(words / 15));
      const estimatedParagraphs = Math.max(1, Math.round(words / 75));

      return {
        wordCount: words,
        readingMinutes,
        speakingMinutes,
        estimatedChars,
        estimatedSentences,
        estimatedParagraphs,
        readingSeconds: Math.round(readingMinutes * 60)
      };
    },
    formatResult: (res: { wordCount: number; readingMinutes: number; estimatedChars: number; readingSeconds: number; estimatedSentences: number; estimatedParagraphs: number }) => ({
      primary: {
        label: 'Estimated Reading Time',
        value: res.readingSeconds < 60 ? `${res.readingSeconds} seconds` : `${ResultFormatter.formatDecimal(res.readingMinutes, 1)} min`,
        numericValue: res.readingMinutes
      },
      secondary: [
        { label: 'Total Words', value: ResultFormatter.formatInteger(res.wordCount) },
        { label: 'Estimated Characters', value: ResultFormatter.formatInteger(res.estimatedChars) },
        { label: 'Sentences (~15 w/s)', value: ResultFormatter.formatInteger(res.estimatedSentences) },
        { label: 'Paragraphs (~75 w/p)', value: ResultFormatter.formatInteger(res.estimatedParagraphs) }
      ]
    })
  },

  // 2. Case Converter Tool
  {
    id: 'case-converter-tool',
    name: 'Text Case Converter & Capitalization Tool',
    category: 'tools',
    subcategoryId: 'tools-text',
    formulaMeta: {
      formulaName: 'Delimiter Transformation & Casing Normalization',
      formulaExpression: 'Tokenize string → normalize casing → join with target delimiter',
      variables: [
        { symbol: 'W', name: 'Word Count' },
        { symbol: 'Tokens', name: 'Parsed Tokens' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'wordCount', label: 'Sample Words', type: 'integer', required: true, defaultValue: 10, min: 1 },
        {
          name: 'targetCase',
          label: 'Target Case Format',
          type: 'select',
          required: true,
          defaultValue: 'titleCase',
          options: [
            { label: 'Title Case', value: 'titleCase' },
            { label: 'UPPERCASE', value: 'uppercase' },
            { label: 'lowercase', value: 'lowercase' },
            { label: 'camelCase', value: 'camelCase' },
            { label: 'snake_case', value: 'snakeCase' },
            { label: 'kebab-case', value: 'kebabCase' }
          ]
        }
      ]
    },
    validate: (inputs: { wordCount: number }): CalculationError[] => {
      if (typeof inputs.wordCount !== 'number' || isNaN(inputs.wordCount) || inputs.wordCount < 1) {
        return [{ field: 'wordCount', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Word count must be at least 1' }];
      }
      return [];
    },
    calculate: (inputs: { wordCount: number; targetCase: string }) => {
      const count = inputs.wordCount || 10;
      const targetCase = inputs.targetCase || 'titleCase';
      return {
        wordCount: count,
        targetCase,
        processedTokens: count,
        transformationEfficiency: 100
      };
    },
    formatResult: (res: { wordCount: number; targetCase: string }) => ({
      primary: {
        label: 'Casing Transformation Target',
        value: res.targetCase.toUpperCase(),
        numericValue: res.wordCount
      },
      secondary: [
        { label: 'Tokens Processed', value: `${res.wordCount} words` },
        { label: 'Case Format', value: res.targetCase }
      ]
    })
  },

  // 3. Lorem Ipsum Generator
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Placeholder Text Generator',
    category: 'tools',
    subcategoryId: 'tools-text',
    formulaMeta: {
      formulaName: 'Cyclic Corpus Distribution',
      formulaExpression: 'Text = repeat(Cicero corpus, count) → format paragraphs',
      variables: [
        { symbol: 'P', name: 'Paragraph Count' },
        { symbol: 'W', name: 'Words per Paragraph' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'paragraphs', label: 'Paragraphs', type: 'integer', required: true, defaultValue: 3, min: 1, max: 20 },
        { name: 'wordsPerParagraph', label: 'Words per Paragraph', type: 'integer', required: true, defaultValue: 50, min: 10, max: 200 }
      ]
    },
    validate: (inputs: { paragraphs: number; wordsPerParagraph: number }): CalculationError[] => {
      if (typeof inputs.paragraphs !== 'number' || inputs.paragraphs < 1) {
        return [{ field: 'paragraphs', code: 'RANGE_OUT_OF_BOUNDS', message: 'Paragraphs must be between 1 and 20' }];
      }
      if (typeof inputs.wordsPerParagraph !== 'number' || inputs.wordsPerParagraph < 10) {
        return [{ field: 'wordsPerParagraph', code: 'RANGE_OUT_OF_BOUNDS', message: 'Words per paragraph must be at least 10' }];
      }
      return [];
    },
    calculate: (inputs: { paragraphs: number; wordsPerParagraph: number }) => {
      const p = inputs.paragraphs ?? 3;
      const wpp = inputs.wordsPerParagraph ?? 50;
      const totalWords = p * wpp;
      const estimatedBytes = Math.round(totalWords * 6.2);
      return {
        paragraphs: p,
        wordsPerParagraph: wpp,
        totalWords,
        estimatedBytes
      };
    },
    formatResult: (res: { paragraphs: number; totalWords: number; estimatedBytes: number }) => ({
      primary: {
        label: 'Generated Placeholder Words',
        value: `${ResultFormatter.formatInteger(res.totalWords)} words`,
        numericValue: res.totalWords
      },
      secondary: [
        { label: 'Paragraph Count', value: `${res.paragraphs} paragraphs` },
        { label: 'Estimated Payload Size', value: `${ResultFormatter.formatInteger(res.estimatedBytes)} bytes` }
      ]
    })
  },

  // 4. JSON Formatter & Validator
  {
    id: 'json-formatter-validator',
    name: 'JSON Formatter, Minifier & Syntax Validator',
    category: 'tools',
    subcategoryId: 'tools-developer',
    formulaMeta: {
      formulaName: 'AST Serialization & Indentation Formatting',
      formulaExpression: 'Formatted = JSON.stringify(JSON.parse(raw), null, indentSpaces)',
      variables: [
        { symbol: 'Indent', name: 'Indentation Spaces' },
        { symbol: 'Size', name: 'Payload Byte Size' }
      ]
    },
    inputSchema: {
      fields: [
        {
          name: 'indentation',
          label: 'Indentation Style',
          type: 'select',
          required: true,
          defaultValue: '2',
          options: [
            { label: '2 Spaces (Standard)', value: '2' },
            { label: '4 Spaces (Extended)', value: '4' },
            { label: 'Minified (0 Spaces)', value: '0' }
          ]
        },
        { name: 'approximateKeys', label: 'Approximate JSON Keys', type: 'integer', required: true, defaultValue: 15, min: 1 }
      ]
    },
    validate: (inputs: { approximateKeys: number }): CalculationError[] => {
      if (typeof inputs.approximateKeys !== 'number' || inputs.approximateKeys < 1) {
        return [{ field: 'approximateKeys', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Must be at least 1 key' }];
      }
      return [];
    },
    calculate: (inputs: { indentation: string; approximateKeys: number }) => {
      const spaces = parseInt(inputs.indentation || '2', 10);
      const keys = inputs.approximateKeys ?? 15;
      const minifiedBytes = keys * 24;
      const beautifiedBytes = minifiedBytes + keys * spaces * 2;
      const ratio = minifiedBytes > 0 ? (beautifiedBytes / minifiedBytes).toFixed(2) : '1.0';

      return {
        indentation: spaces,
        approximateKeys: keys,
        minifiedBytes,
        beautifiedBytes,
        ratio
      };
    },
    formatResult: (res: { indentation: number; approximateKeys: number; beautifiedBytes: number; minifiedBytes: number }) => ({
      primary: {
        label: 'Formatted Payload Size',
        value: `${res.beautifiedBytes} bytes (${res.indentation === 0 ? 'Minified' : `${res.indentation}-space indent`})`,
        numericValue: res.beautifiedBytes
      },
      secondary: [
        { label: 'Minified Footprint', value: `${res.minifiedBytes} bytes` },
        { label: 'Key-Value Pairs', value: `${res.approximateKeys} nodes` }
      ]
    })
  },

  // 5. Base64 Encoder & Decoder
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Text & URL Encoder / Decoder',
    category: 'tools',
    subcategoryId: 'tools-developer',
    formulaMeta: {
      formulaName: 'Radix-64 Octet Expansion',
      formulaExpression: 'Base64_length = 4 × ceil(RawBytes / 3)',
      variables: [
        { symbol: 'Raw', name: 'Raw Input Bytes' },
        { symbol: 'B64', name: 'Encoded Base64 Characters' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'byteLength', label: 'Input Byte Size', type: 'integer', required: true, defaultValue: 120, min: 1 },
        {
          name: 'mode',
          label: 'Operation Mode',
          type: 'select',
          required: true,
          defaultValue: 'encode',
          options: [
            { label: 'Encode to Base64 (+33.3% overhead)', value: 'encode' },
            { label: 'Decode from Base64 (-25% size)', value: 'decode' }
          ]
        }
      ]
    },
    validate: (inputs: { byteLength: number }): CalculationError[] => {
      if (typeof inputs.byteLength !== 'number' || inputs.byteLength < 1) {
        return [{ field: 'byteLength', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Byte size must be positive' }];
      }
      return [];
    },
    calculate: (inputs: { byteLength: number; mode: string }) => {
      const bytes = inputs.byteLength ?? 120;
      const mode = inputs.mode || 'encode';
      const encodedLength = 4 * Math.ceil(bytes / 3);
      const decodedLength = Math.floor((bytes * 3) / 4);
      const paddingChars = (3 - (bytes % 3)) % 3;

      return {
        bytes,
        mode,
        encodedLength,
        decodedLength,
        paddingChars,
        overheadPct: 33.33
      };
    },
    formatResult: (res: { mode: string; encodedLength: number; decodedLength: number; bytes: number; paddingChars: number }) => ({
      primary: {
        label: res.mode === 'encode' ? 'Encoded Base64 Length' : 'Decoded Byte Length',
        value: `${res.mode === 'encode' ? res.encodedLength : res.decodedLength} chars`,
        numericValue: res.mode === 'encode' ? res.encodedLength : res.decodedLength
      },
      secondary: [
        { label: 'Original Size', value: `${res.bytes} bytes` },
        { label: 'Padding Equals (=)', value: `${res.paddingChars} padding character(s)` },
        { label: 'Encoding Overhead', value: '+33.33%' }
      ]
    })
  },

  // 6. Cryptographic Hash Generator
  {
    id: 'hash-generator-tool',
    name: 'Cryptographic Hash & Checksum Generator',
    category: 'tools',
    subcategoryId: 'tools-developer',
    formulaMeta: {
      formulaName: 'Cryptographic Digest Function',
      formulaExpression: 'Digest = Hash(Message, Algorithm); Length = BitSize / 4 hex characters',
      variables: [
        { symbol: 'Bits', name: 'Hash Bit Width' },
        { symbol: 'Hex', name: 'Hexadecimal Output Length' }
      ]
    },
    inputSchema: {
      fields: [
        {
          name: 'algorithm',
          label: 'Hashing Algorithm',
          type: 'select',
          required: true,
          defaultValue: 'sha256',
          options: [
            { label: 'SHA-256 (256-bit Secure)', value: 'sha256' },
            { label: 'SHA-512 (512-bit High Security)', value: 'sha512' },
            { label: 'SHA-1 (160-bit Legacy)', value: 'sha1' },
            { label: 'MD5 (128-bit Checksum)', value: 'md5' }
          ]
        },
        { name: 'messageLength', label: 'Message Length (Characters)', type: 'integer', required: true, defaultValue: 48, min: 1 }
      ]
    },
    validate: (inputs: { messageLength: number }): CalculationError[] => {
      if (typeof inputs.messageLength !== 'number' || inputs.messageLength < 1) {
        return [{ field: 'messageLength', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Message length must be at least 1' }];
      }
      return [];
    },
    calculate: (inputs: { algorithm: string; messageLength: number }) => {
      const algo = inputs.algorithm || 'sha256';
      const bitMap: Record<string, number> = {
        sha256: 256,
        sha512: 512,
        sha1: 160,
        md5: 128
      };
      const bits = bitMap[algo] || 256;
      const hexChars = bits / 4;
      const entropy = bits;

      return {
        algorithm: algo.toUpperCase(),
        bits,
        hexChars,
        entropy,
        messageLength: inputs.messageLength ?? 48
      };
    },
    formatResult: (res: { algorithm: string; hexChars: number; bits: number }) => ({
      primary: {
        label: `${res.algorithm} Digest Output Length`,
        value: `${res.hexChars} hex characters (${res.bits} bits)`,
        numericValue: res.hexChars
      },
      secondary: [
        { label: 'Algorithm', value: res.algorithm },
        { label: 'Collision Resistance', value: res.bits >= 256 ? 'High (Cryptographically Secure)' : 'Legacy Checksum Only' }
      ]
    })
  },

  // 7. Regex Tester Tool
  {
    id: 'regex-tester-tool',
    name: 'Regular Expression Tester & Matcher',
    category: 'tools',
    subcategoryId: 'tools-developer',
    formulaMeta: {
      formulaName: 'Deterministic Finite Automaton Evaluation',
      formulaExpression: 'Matches = RegExp(pattern, flags).exec(corpus)',
      variables: [
        { symbol: 'Len', name: 'Target String Length' },
        { symbol: 'Matches', name: 'Matched Substrings' }
      ]
    },
    inputSchema: {
      fields: [
        {
          name: 'flags',
          label: 'RegExp Flags',
          type: 'select',
          required: true,
          defaultValue: 'g',
          options: [
            { label: 'Global (g)', value: 'g' },
            { label: 'Case Insensitive + Global (gi)', value: 'gi' },
            { label: 'Multiline + Global (gm)', value: 'gm' },
            { label: 'DotAll + Global (gs)', value: 'gs' }
          ]
        },
        { name: 'sampleTextWords', label: 'Sample Corpus Words', type: 'integer', required: true, defaultValue: 100, min: 10 }
      ]
    },
    validate: (inputs: { sampleTextWords: number }): CalculationError[] => {
      if (typeof inputs.sampleTextWords !== 'number' || inputs.sampleTextWords < 10) {
        return [{ field: 'sampleTextWords', code: 'RANGE_OUT_OF_BOUNDS', message: 'Corpus words must be at least 10' }];
      }
      return [];
    },
    calculate: (inputs: { flags: string; sampleTextWords: number }) => {
      const words = inputs.sampleTextWords ?? 100;
      const flags = inputs.flags || 'g';
      return {
        flags,
        words,
        estimatedExecutionMs: '< 1 ms',
        linearComplexity: 'O(N) match scan'
      };
    },
    formatResult: (res: { flags: string; words: number }) => ({
      primary: {
        label: 'Active Regex Engine State',
        value: `Flags: /${res.flags}/ on ${res.words} words`,
        numericValue: res.words
      },
      secondary: [
        { label: 'Evaluation Engine', value: 'JavaScript ECMAScript RegExp' },
        { label: 'Corpus Scope', value: `${res.words} sample words` }
      ]
    })
  },

  // 8. Unix Timestamp Converter
  {
    id: 'unix-timestamp-converter',
    name: 'Unix Timestamp & Epoch Date Converter',
    category: 'tools',
    subcategoryId: 'tools-datetime',
    formulaMeta: {
      formulaName: 'POSIX Epoch Seconds to UTC Coordinates',
      formulaExpression: 'Date = EpochSeconds × 1000 ms since 1970-01-01T00:00:00Z',
      variables: [
        { symbol: 'Epoch', name: 'Epoch Timestamp (seconds)' },
        { symbol: 'UTC', name: 'Coordinated Universal Time' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'epochSeconds', label: 'Unix Timestamp (Seconds)', type: 'integer', required: true, defaultValue: 1735689600, min: 0 },
        {
          name: 'targetFormat',
          label: 'Display Output Format',
          type: 'select',
          required: true,
          defaultValue: 'iso',
          options: [
            { label: 'ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)', value: 'iso' },
            { label: 'UTC String (RFC 2822)', value: 'utc' },
            { label: 'Milliseconds Timestamp (ms)', value: 'ms' }
          ]
        }
      ]
    },
    validate: (inputs: { epochSeconds: number }): CalculationError[] => {
      if (typeof inputs.epochSeconds !== 'number' || isNaN(inputs.epochSeconds) || inputs.epochSeconds < 0) {
        return [{ field: 'epochSeconds', code: 'NON_NEGATIVE_REQUIRED', message: 'Epoch seconds must be non-negative' }];
      }
      return [];
    },
    calculate: (inputs: { epochSeconds: number; targetFormat: string }) => {
      const sec = inputs.epochSeconds ?? 1735689600;
      const d = new Date(sec * 1000);
      const iso = d.toISOString();
      const utcString = d.toUTCString();
      const ms = sec * 1000;
      const daysSinceEpoch = Math.floor(sec / 86400);

      return {
        epochSeconds: sec,
        iso,
        utcString,
        ms,
        daysSinceEpoch,
        year: d.getUTCFullYear()
      };
    },
    formatResult: (res: { iso: string; epochSeconds: number; utcString: string; daysSinceEpoch: number; ms: number }) => ({
      primary: {
        label: 'Converted UTC Date',
        value: res.iso,
        numericValue: res.epochSeconds
      },
      secondary: [
        { label: 'RFC 2822 UTC', value: res.utcString },
        { label: 'Milliseconds (ms)', value: ResultFormatter.formatInteger(res.ms) },
        { label: 'Days Since Epoch', value: `${ResultFormatter.formatInteger(res.daysSinceEpoch)} days` }
      ]
    })
  },

  // 9. Aspect Ratio Solver
  {
    id: 'aspect-ratio-calculator',
    name: 'Image & Video Aspect Ratio Solver',
    category: 'tools',
    subcategoryId: 'tools-image',
    formulaMeta: {
      formulaName: 'Proportional Geometric Scaling',
      formulaExpression: 'AspectRatio = Width / Height; TargetHeight = TargetWidth × (Height / Width)',
      variables: [
        { symbol: 'W', name: 'Source Width' },
        { symbol: 'H', name: 'Source Height' },
        { symbol: 'W_tgt', name: 'Target Width' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'width', label: 'Source Width (px)', type: 'integer', required: true, defaultValue: 1920, min: 1 },
        { name: 'height', label: 'Source Height (px)', type: 'integer', required: true, defaultValue: 1080, min: 1 },
        { name: 'targetWidth', label: 'Scale to Target Width (px)', type: 'integer', required: false, defaultValue: 1280, min: 1 }
      ]
    },
    validate: (inputs: { width: number; height: number }): CalculationError[] => {
      if (typeof inputs.width !== 'number' || inputs.width < 1) {
        return [{ field: 'width', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Width must be at least 1 pixel' }];
      }
      if (typeof inputs.height !== 'number' || inputs.height < 1) {
        return [{ field: 'height', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Height must be at least 1 pixel' }];
      }
      return [];
    },
    calculate: (inputs: { width: number; height: number; targetWidth?: number }) => {
      const w = inputs.width || 1920;
      const h = inputs.height || 1080;
      const tgtW = inputs.targetWidth || 1280;

      // Greatest Common Divisor
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratioW = w / divisor;
      const ratioH = h / divisor;
      const decimalRatio = w / h;
      const targetHeight = Math.round(tgtW / decimalRatio);
      const megapixels = (w * h) / 1000000;

      return {
        width: w,
        height: h,
        ratioString: `${ratioW}:${ratioH}`,
        decimalRatio,
        targetWidth: tgtW,
        targetHeight,
        megapixels
      };
    },
    formatResult: (res: { ratioString: string; decimalRatio: number; targetWidth: number; targetHeight: number; megapixels: number }) => ({
      primary: {
        label: 'Aspect Ratio',
        value: `${res.ratioString} (${ResultFormatter.formatDecimal(res.decimalRatio, 3)}:1)`,
        numericValue: res.decimalRatio
      },
      secondary: [
        { label: 'Scaled Resolution', value: `${res.targetWidth} × ${res.targetHeight} px` },
        { label: 'Source Megapixels', value: `${ResultFormatter.formatDecimal(res.megapixels, 2)} MP` }
      ]
    })
  },

  // 10. File Download & Bandwidth Tool
  {
    id: 'file-size-bandwidth-tool',
    name: 'File Download Time & Bandwidth Tool',
    category: 'tools',
    subcategoryId: 'tools-file',
    formulaMeta: {
      formulaName: 'Throughput Transfer Duration',
      formulaExpression: 'TimeSeconds = (FileSizeMB × 8 megabits) / BandwidthMbps',
      variables: [
        { symbol: 'Size', name: 'File Size (MB)' },
        { symbol: 'Speed', name: 'Bandwidth (Mbps)' },
        { symbol: 'Time', name: 'Transfer Time (s)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'fileSizeMB', label: 'File Size (Megabytes)', type: 'number', required: true, defaultValue: 1024, min: 0.1 },
        { name: 'bandwidthMbps', label: 'Internet Download Speed (Mbps)', type: 'number', required: true, defaultValue: 100, min: 0.1 }
      ]
    },
    validate: (inputs: { fileSizeMB: number; bandwidthMbps: number }): CalculationError[] => {
      if (typeof inputs.fileSizeMB !== 'number' || inputs.fileSizeMB <= 0) {
        return [{ field: 'fileSizeMB', code: 'POSITIVE_NUMBER_REQUIRED', message: 'File size must be greater than 0' }];
      }
      if (typeof inputs.bandwidthMbps !== 'number' || inputs.bandwidthMbps <= 0) {
        return [{ field: 'bandwidthMbps', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Bandwidth must be greater than 0' }];
      }
      return [];
    },
    calculate: (inputs: { fileSizeMB: number; bandwidthMbps: number }) => {
      const sizeMB = inputs.fileSizeMB ?? 1024;
      const speedMbps = inputs.bandwidthMbps ?? 100;
      const bits = sizeMB * 8;
      const seconds = bits / speedMbps;
      const minutes = seconds / 60;
      const hours = minutes / 60;
      const formattedDuration = seconds < 60 ? `${Math.round(seconds)} sec` : minutes < 60 ? `${ResultFormatter.formatDecimal(minutes, 1)} min` : `${ResultFormatter.formatDecimal(hours, 2)} hrs`;

      return {
        fileSizeMB: sizeMB,
        bandwidthMbps: speedMbps,
        seconds,
        minutes,
        hours,
        formattedDuration
      };
    },
    formatResult: (res: { formattedDuration: string; seconds: number; fileSizeMB: number; bandwidthMbps: number }) => ({
      primary: {
        label: 'Estimated Download Time',
        value: res.formattedDuration,
        numericValue: res.seconds
      },
      secondary: [
        { label: 'File Size', value: `${res.fileSizeMB} MB (${ResultFormatter.formatDecimal(res.fileSizeMB / 1024, 2)} GB)` },
        { label: 'Transfer Bandwidth', value: `${res.bandwidthMbps} Mbps` },
        { label: 'Exact Seconds', value: `${ResultFormatter.formatDecimal(res.seconds, 1)} s` }
      ]
    })
  },

  // 11. Color Converter & Picker Tool
  {
    id: 'color-converter-picker',
    name: 'HEX, RGB, HSL & CMYK Color Converter Tool',
    category: 'tools',
    subcategoryId: 'tools-color',
    formulaMeta: {
      formulaName: 'Photometric Color Coordinate Mapping',
      formulaExpression: 'HEX = #(R_hex)(G_hex)(B_hex); HSL = polar RGB; CMYK = subtractive pigment',
      variables: [
        { symbol: 'RGB', name: 'Red, Green, Blue Channels (0-255)' },
        { symbol: 'HEX', name: 'Hexadecimal Hexcode (#RRGGBB)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'red', label: 'Red Channel (0-255)', type: 'integer', required: true, defaultValue: 37, min: 0, max: 255 },
        { name: 'green', label: 'Green Channel (0-255)', type: 'integer', required: true, defaultValue: 99, min: 0, max: 255 },
        { name: 'blue', label: 'Blue Channel (0-255)', type: 'integer', required: true, defaultValue: 235, min: 0, max: 255 }
      ]
    },
    validate: (inputs: { red: number; green: number; blue: number }): CalculationError[] => {
      if (inputs.red < 0 || inputs.red > 255) return [{ field: 'red', code: 'RANGE_OUT_OF_BOUNDS', message: 'Red must be 0-255' }];
      if (inputs.green < 0 || inputs.green > 255) return [{ field: 'green', code: 'RANGE_OUT_OF_BOUNDS', message: 'Green must be 0-255' }];
      if (inputs.blue < 0 || inputs.blue > 255) return [{ field: 'blue', code: 'RANGE_OUT_OF_BOUNDS', message: 'Blue must be 0-255' }];
      return [];
    },
    calculate: (inputs: { red: number; green: number; blue: number }) => {
      const r = Math.min(255, Math.max(0, inputs.red ?? 37));
      const g = Math.min(255, Math.max(0, inputs.green ?? 99));
      const b = Math.min(255, Math.max(0, inputs.blue ?? 235));

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

      // HSL Conversion
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }
      const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

      // CMYK Conversion
      const k = 1 - Math.max(rNorm, gNorm, bNorm);
      const c = k === 1 ? 0 : Math.round(((1 - rNorm - k) / (1 - k)) * 100);
      const m = k === 1 ? 0 : Math.round(((1 - gNorm - k) / (1 - k)) * 100);
      const y = k === 1 ? 0 : Math.round(((1 - bNorm - k) / (1 - k)) * 100);
      const cmyk = `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;

      return {
        hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl,
        cmyk,
        red: r,
        green: g,
        blue: b
      };
    },
    formatResult: (res: { hex: string; rgb: string; hsl: string; cmyk: string }) => ({
      primary: {
        label: 'Hexadecimal Color Code',
        value: res.hex,
        numericValue: res.hex
      },
      secondary: [
        { label: 'RGB Notation', value: res.rgb },
        { label: 'HSL Notation', value: res.hsl },
        { label: 'CMYK Print Code', value: res.cmyk }
      ]
    })
  },

  // 12. URL Encoder & Decoder
  {
    id: 'url-encoder-decoder',
    name: 'URL Percent Encoder & Query Decoder Tool',
    category: 'tools',
    subcategoryId: 'tools-web',
    formulaMeta: {
      formulaName: 'RFC 3986 Percent-Encoding Transformation',
      formulaExpression: 'Percent_Encode = replace(ReservedChars, %XX hex)',
      variables: [
        { symbol: 'URL', name: 'Raw Uniform Resource Identifier' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'characterLength', label: 'Query Character Length', type: 'integer', required: true, defaultValue: 60, min: 1 },
        {
          name: 'mode',
          label: 'Operation Mode',
          type: 'select',
          required: true,
          defaultValue: 'encode',
          options: [
            { label: 'Encode (RFC 3986 percent encoding)', value: 'encode' },
            { label: 'Decode (Percent-encoded string to plain text)', value: 'decode' }
          ]
        }
      ]
    },
    validate: (inputs: { characterLength: number }): CalculationError[] => {
      if (typeof inputs.characterLength !== 'number' || inputs.characterLength < 1) {
        return [{ field: 'characterLength', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Character length must be at least 1' }];
      }
      return [];
    },
    calculate: (inputs: { characterLength: number; mode: string }) => {
      const len = inputs.characterLength ?? 60;
      const mode = inputs.mode || 'encode';
      return {
        characterLength: len,
        mode,
        rfcStandard: 'RFC 3986 / URI Component Compliant'
      };
    },
    formatResult: (res: { mode: string; characterLength: number }) => ({
      primary: {
        label: res.mode === 'encode' ? 'URL Percent-Encoding' : 'URL Percent-Decoding',
        value: `${res.characterLength} characters processed`,
        numericValue: res.characterLength
      },
      secondary: [
        { label: 'Standard', value: 'RFC 3986 Specification' },
        { label: 'Safety', value: 'Browser & Server-side Safe' }
      ]
    })
  },

  // 13. HTML Entity Converter
  {
    id: 'html-entity-converter',
    name: 'HTML Entity Encoder & Decoder Tool',
    category: 'tools',
    subcategoryId: 'tools-web',
    formulaMeta: {
      formulaName: 'HTML Special Character Sanitization',
      formulaExpression: '& → &amp;; < → &lt;; > → &gt;; " → &quot;; \' → &#39;',
      variables: [
        { symbol: 'Char', name: 'Raw Reserved Character' },
        { symbol: 'Entity', name: 'Named HTML Entity' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'entityCount', label: 'Sample Characters', type: 'integer', required: true, defaultValue: 25, min: 1 },
        {
          name: 'mode',
          label: 'Target Entity Format',
          type: 'select',
          required: true,
          defaultValue: 'named',
          options: [
            { label: 'Named HTML Entities (&amp;, &lt;, &gt;)', value: 'named' },
            { label: 'Decimal Numeric Entities (&#38;, &#60;)', value: 'decimal' },
            { label: 'Hexadecimal Numeric Entities (&#x26;, &#x3C;)', value: 'hex' }
          ]
        }
      ]
    },
    validate: (inputs: { entityCount: number }): CalculationError[] => {
      if (typeof inputs.entityCount !== 'number' || inputs.entityCount < 1) {
        return [{ field: 'entityCount', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Must be at least 1 character' }];
      }
      return [];
    },
    calculate: (inputs: { entityCount: number; mode: string }) => {
      const count = inputs.entityCount ?? 25;
      const mode = inputs.mode || 'named';
      return {
        entityCount: count,
        mode,
        xssSafe: true
      };
    },
    formatResult: (res: { mode: string; entityCount: number }) => ({
      primary: {
        label: 'HTML Entity Sanitization',
        value: `${res.entityCount} characters encoded (${res.mode})`,
        numericValue: res.entityCount
      },
      secondary: [
        { label: 'Format Style', value: res.mode.toUpperCase() },
        { label: 'Security', value: 'Mitigates XSS in HTML body injection' }
      ]
    })
  },

  // 14. QR Code Payload Generator
  {
    id: 'qr-code-payload-generator',
    name: 'QR Code Text, URL & Wi-Fi Payload Formatter',
    category: 'tools',
    subcategoryId: 'tools-productivity',
    formulaMeta: {
      formulaName: 'Standardized 2D Barcode Payload Schema',
      formulaExpression: 'Wi-Fi: WIFI:S:ssid;T:WPA;P:key;; | URL: https://... | Email: mailto:...',
      variables: [
        { symbol: 'Type', name: 'QR Schema Type' },
        { symbol: 'ECC', name: 'Error Correction Level' }
      ]
    },
    inputSchema: {
      fields: [
        {
          name: 'qrType',
          label: 'QR Code Data Type',
          type: 'select',
          required: true,
          defaultValue: 'url',
          options: [
            { label: 'Website URL (https://...)', value: 'url' },
            { label: 'Wi-Fi Network Login (WPA/WPA2/WPA3)', value: 'wifi' },
            { label: 'Plain Text Note', value: 'text' },
            { label: 'Email Mailto Action', value: 'email' }
          ]
        },
        {
          name: 'errorCorrection',
          label: 'Error Correction Level (ECC)',
          type: 'select',
          required: true,
          defaultValue: 'M',
          options: [
            { label: 'Low - 7% Recovery (L)', value: 'L' },
            { label: 'Medium - 15% Recovery (M)', value: 'M' },
            { label: 'Quartile - 25% Recovery (Q)', value: 'Q' },
            { label: 'High - 30% Recovery (H)', value: 'H' }
          ]
        }
      ]
    },
    validate: (): CalculationError[] => {
      return [];
    },
    calculate: (inputs: { qrType: string; errorCorrection: string }) => {
      const type = inputs.qrType || 'url';
      const ecc = inputs.errorCorrection || 'M';
      const recoveryPctMap: Record<string, string> = {
        L: '7% damage recovery',
        M: '15% damage recovery',
        Q: '25% damage recovery',
        H: '30% damage recovery'
      };

      return {
        qrType: type.toUpperCase(),
        errorCorrection: ecc,
        recovery: recoveryPctMap[ecc] || '15% recovery',
        standardCompliance: 'ISO/IEC 18004'
      };
    },
    formatResult: (res: { qrType: string; errorCorrection: string; recovery: string }) => ({
      primary: {
        label: 'Formatted QR Payload Schema',
        value: `${res.qrType} Schema (ECC ${res.errorCorrection})`,
        numericValue: res.qrType
      },
      secondary: [
        { label: 'Error Correction', value: res.recovery },
        { label: 'Standard', value: 'ISO/IEC 18004 Barcode Schema' }
      ]
    })
  }
];
