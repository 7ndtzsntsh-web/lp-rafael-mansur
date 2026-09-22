// Põe um código no nome de cada arquivo de estilo e script: style.a1b2c3d4.css
//
// Por que isso existe: os arquivos eram trocados mantendo o mesmo nome. Quem já tinha
// visitado o site continuava usando a versão guardada no navegador e NÃO via as mudanças.
// Aconteceu de verdade: o espaçamento da legenda estava certo no servidor e errado na tela.
// Com o código no nome, cada versão é um endereço novo — ninguém tem em cache, então
// todo mundo recebe a versão nova na hora.
//
// Roda depois de build:css.  ->  npm run build
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const ARQUIVOS = [
  { pasta: 'css', base: 'style', ext: 'css' },
  { pasta: 'css', base: 'aos', ext: 'css' },
  { pasta: 'js', base: 'aos', ext: 'js' },
  { pasta: 'js', base: 'app', ext: 'js' },
];

let html = readFileSync('index.html', 'utf8');

for (const { pasta, base, ext } of ARQUIVOS) {
  // Acha o arquivo atual: o sem código no nome, ou o que já tem um.
  const existentes = readdirSync(pasta).filter(
    (f) => f === `${base}.${ext}` || new RegExp(`^${base}\\.[0-9a-f]{8}\\.${ext}$`).test(f)
  );
  if (!existentes.length) throw new Error(`não achei ${pasta}/${base}.${ext}`);

  // Qual arquivo vale?
  // Se existe o SEM código no nome, ele é a edição mais recente e tem prioridade —
  // é o que o build:css acabou de escrever, ou o que alguém editou à mão.
  // (Antes eu dava prioridade ao que o HTML apontava, e uma edição em js/app.js
  //  era APAGADA em silêncio porque o HTML ainda apontava para a versão antiga.)
  const semCodigo = `${base}.${ext}`;
  const apontado = existentes.includes(semCodigo)
    ? semCodigo
    : existentes.find((f) => html.includes(`${pasta}/${f}`)) || existentes[0];
  const conteudo = readFileSync(join(pasta, apontado));
  const codigo = createHash('sha256').update(conteudo).digest('hex').slice(0, 8);
  const novo = `${base}.${codigo}.${ext}`;

  // Grava a versão nova e apaga as antigas.
  writeFileSync(join(pasta, novo), conteudo);
  for (const f of existentes) if (f !== novo) unlinkSync(join(pasta, f));

  // Aponta o index.html para o nome novo.
  const antes = html;
  html = html.replace(
    new RegExp(`${pasta}/${base}(?:\\.[0-9a-f]{8})?\\.${ext}`, 'g'),
    `${pasta}/${novo}`
  );
  const mudou = apontado !== novo;
  console.log(`${pasta}/${novo}${mudou ? `  (antes: ${apontado})` : '  (sem mudanca)'}`);
  if (!mudou && antes !== html) console.log(`  aviso: ${pasta}/${novo} nao estava referenciado no HTML`);
}

// Os scripts têm selo de integridade (SRI). O conteúdo não mudou, mas o caminho sim:
// recalcula para o arquivo novo, senão o navegador bloqueia o script.
html = html.replace(/<script src="(js\/[^"]+)"([^>]*)>/g, (todo, src, resto) => {
  const selo = 'sha384-' + createHash('sha384').update(readFileSync(src)).digest('base64');
  const semSelo = resto.replace(/\s*integrity="[^"]*"/, '');
  const comCross = /crossorigin=/.test(semSelo) ? semSelo : semSelo + ' crossorigin="anonymous"';
  return `<script src="${src}" integrity="${selo}"${comCross}>`;
});

writeFileSync('index.html', html);
console.log('index.html atualizado.');
