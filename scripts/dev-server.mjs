// Servidor de teste local que aplica os MESMOS cabeçalhos do vercel.json,
// para checar CSP e o scanner de segurança antes de publicar.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
const globais = cfg.headers.find((h) => h.source === '/(.*)').headers;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};
const raiz = process.cwd();
const porta = Number(process.argv[2]) || 4321;

createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const alvo = resolve(join(raiz, p));
  for (const h of globais) res.setHeader(h.key, h.value);
  // Nunca servir nada fora da pasta do projeto.
  if (!alvo.startsWith(raiz) || !existsSync(alvo) || !statSync(alvo).isFile()) {
    res.writeHead(404);
    return res.end('nao encontrado');
  }
  res.setHeader('Content-Type', TIPOS[extname(alvo)] || 'application/octet-stream');
  res.writeHead(200);
  res.end(readFileSync(alvo));
}).listen(porta, () => console.log('teste em http://localhost:' + porta));
