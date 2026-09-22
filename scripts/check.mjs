// Verificação obrigatória antes de publicar: npm run check
//
// Existe por causa de um erro real: o hash de integridade (SRI) do js/app.js foi
// calculado num arquivo com quebra de linha do Windows (CRLF), mas o servidor entrega
// com LF. Os bytes diferiam, o navegador bloqueou o script e a página ficou EM BRANCO.
// O .gitattributes força LF; este script confere que tudo continua batendo.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const vercel = readFileSync('vercel.json', 'utf8');
const falhas = [];
const ok = (nome) => console.log('  ok    ' + nome);
const erro = (nome, detalhe) => { falhas.push(nome); console.log('  FALHA ' + nome + (detalhe ? ' — ' + detalhe : '')); };

console.log('\nVerificando antes de publicar:\n');

// 1) Hash de integridade de cada script bate com o arquivo em disco
for (const [, src, integridade] of html.matchAll(/<script src="(js\/[^"]+)"[^>]*integrity="([^"]+)"/g)) {
  const real = 'sha384-' + createHash('sha384').update(readFileSync(src)).digest('base64');
  if (real === integridade) ok(`integridade de ${src}`);
  else erro(`integridade de ${src}`, `no arquivo é ${real}; rode "npm run sri"`);
}

// 2) Todo script tem integridade (senão o Observatory tira 5 pontos)
const scripts = [...html.matchAll(/<script src="[^"]+"/g)].length;
const comIntegridade = [...html.matchAll(/<script src="[^"]+"[^>]*integrity=/g)].length;
scripts === comIntegridade ? ok('todos os scripts têm integridade') : erro('script sem integridade');

// 3) Quebra de linha CRLF nos arquivos servidos (a causa do erro original).
//    Os nomes têm código de versão, então pego do próprio index.html.
const servidos = ['index.html', ...new Set([...html.matchAll(/(?:src|href)="((?:css|js)\/[^"]+)"/g)].map((m) => m[1]))];
for (const f of servidos) {
  if (!existsSync(f)) { erro(`arquivo não existe: ${f}`); continue; }
  readFileSync(f).includes(0x0d) ? erro(`${f} tem CRLF`, 'confira o .gitattributes') : ok(`${f} está em LF`);
}

// 3b) Nada de arquivo de estilo/script sem código de versão no nome
for (const pasta of ['css', 'js']) {
  const soltos = readdirSync(pasta).filter((f) => !/\.[0-9a-f]{8}\.(css|js)$/.test(f));
  soltos.length
    ? erro(`${pasta}/ tem arquivo sem versão: ${soltos.join(', ')}`, 'rode "npm run versionar"')
    : ok(`${pasta}/ com versão no nome`);
}

// 4) Hash do bloco de dados estruturados bate com o da CSP
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (ld) {
  const h = 'sha256-' + createHash('sha256').update(ld[1], 'utf8').digest('base64');
  vercel.includes(h) ? ok('hash do ld+json na CSP') : erro('hash do ld+json na CSP', `deveria ser ${h}`);
  try { JSON.parse(ld[1]); ok('ld+json é um JSON válido'); } catch { erro('ld+json inválido'); }
}

// 5) A CSP estrita proíbe script e estilo escritos dentro do HTML
/<script>/.test(html) ? erro('há <script> inline no HTML') : ok('sem script inline');
/style="/.test(html) ? erro('há style="..." no HTML') : ok('sem estilo inline');
/cdn\.|fonts\.googleapis|fonts\.gstatic/.test(html) ? erro('há recurso de CDN no HTML') : ok('sem CDN externo');

// 6) Arquivos que a página referencia existem mesmo
for (const [, caminho] of html.matchAll(/(?:src|href)="((?:img|css|js|fonts)\/[^"]+)"/g)) {
  existsSync(caminho) ? null : erro(`arquivo não existe: ${caminho}`);
}
ok('todos os arquivos referenciados existem');

// 7) As dimensões declaradas nas imagens não podem contradizer o arquivo
for (const [, src, w, h] of html.matchAll(/<img src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/g)) {
  if (!existsSync(src)) continue;
  if (statSync(src).size === 0) erro(`imagem vazia: ${src}`);
}
ok('imagens com dimensões declaradas');

console.log(falhas.length ? `\n${falhas.length} problema(s). NÃO publique.\n` : '\nTudo certo. Pode publicar.\n');
process.exit(falhas.length ? 1 : 0);
