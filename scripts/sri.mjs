// Recalcula os hashes de integridade (SRI) dos scripts no index.html.
// Rodar sempre que js/aos.js ou js/app.js mudarem: npm run sri
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const updated = html.replace(/<script src="(js\/[^"]+)"([^>]*)>/g, (all, src, rest) => {
  const hash = 'sha384-' + createHash('sha384').update(readFileSync(src)).digest('base64');
  const semIntegrity = rest.replace(/\s*integrity="[^"]*"/, '');
  const comCross = /crossorigin=/.test(semIntegrity) ? semIntegrity : semIntegrity + ' crossorigin="anonymous"';
  console.log(`${src} -> ${hash}`);
  return `<script src="${src}" integrity="${hash}"${comCross}>`;
});
writeFileSync('index.html', updated);
console.log('index.html atualizado.');
