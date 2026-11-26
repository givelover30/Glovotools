import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function mjsMimeTypePlugin(): Plugin {
  const applyJsMimeMiddleware = (middlewares: any) => {
    middlewares.use((req: any, res: any, next: any) => {
      const cleanPath = (req.url || '').split('?')[0].toLowerCase();
      if (cleanPath.endsWith('.mjs')) {
        const originalSetHeader = res.setHeader.bind(res);
        const originalWriteHead = res.writeHead.bind(res);

        res.setHeader = (name: string, value: any) => {
          if (name.toLowerCase() === 'content-type') {
            return originalSetHeader(name, 'application/javascript; charset=utf-8');
          }
          return originalSetHeader(name, value);
        };

        res.writeHead = (statusCode: number, ...args: any[]) => {
          const headersArg = typeof args[0] === 'string' ? args[1] : args[0];
          if (headersArg && typeof headersArg === 'object') {
            for (const key of Object.keys(headersArg)) {
              if (key.toLowerCase() === 'content-type') {
                headersArg[key] = 'application/javascript; charset=utf-8';
              }
            }
          }
          originalSetHeader('Content-Type', 'application/javascript; charset=utf-8');
          return originalWriteHead(statusCode, ...args);
        };

        originalSetHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      next();
    });
  };

  return {
    name: 'glovotools-mjs-mime-type',
    configureServer(server) {
      applyJsMimeMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      applyJsMimeMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mjsMimeTypePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
