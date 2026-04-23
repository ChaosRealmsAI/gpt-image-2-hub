import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const root = path.resolve('.');
const worksDir = path.join(root, 'works');

function worksPlugin() {
  return {
    name: 'prompt-atlas-works',
    configureServer(server) {
      server.middlewares.use('/works', (req, res, next) => {
        const pathname = decodeURIComponent((req.url || '').split('?')[0]);
        const file = path.normalize(path.join(worksDir, pathname));
        if (!file.startsWith(worksDir)) return next();
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
        res.setHeader('Cache-Control', 'no-store');
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      const outDir = path.join(root, 'dist', 'works');
      fs.rmSync(outDir, { recursive: true, force: true });
      fs.cpSync(worksDir, outDir, { recursive: true });
    },
  };
}

export default defineConfig({
  root,
  base: './',
  publicDir: false,
  plugins: [worksPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
