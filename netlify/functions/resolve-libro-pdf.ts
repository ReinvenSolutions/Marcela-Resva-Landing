import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PDF_NAME = 'LLEGO_MI_MOMENTO_DIGITAL.pdf';

/**
 * Localiza el PDF sin usar `import.meta.url` (en dev, esbuild puede emitir CJS y `import.meta` falla).
 * `process.cwd()` suele ser la raíz del repo o `client/` según cómo arranque Vite/Netlify.
 */
export function loadLibroPdfBuffer(): Buffer {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'netlify', 'functions', 'assets', PDF_NAME),
    join(cwd, 'client', 'netlify', 'functions', 'assets', PDF_NAME),
    join(cwd, '..', 'netlify', 'functions', 'assets', PDF_NAME),
    join(cwd, '..', 'client', 'netlify', 'functions', 'assets', PDF_NAME),
  ];
  const fromEnv = process.env.LIBRO_PDF_PATH?.trim();
  if (fromEnv) {
    candidates.unshift(fromEnv);
  }
  for (const p of candidates) {
    if (p && existsSync(p)) {
      return readFileSync(p);
    }
  }
  throw new Error(`PDF no encontrado (cwd=${cwd}). Rutas probadas: ${candidates.filter(Boolean).join(' | ')}`);
}
