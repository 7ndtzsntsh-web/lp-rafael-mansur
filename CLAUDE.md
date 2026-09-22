# Site da Rafael Mansur Jiu-Jitsu — regras para o Claude

Site vendido pela Vanguard Web Studio a um cliente real. No ar em https://rafaelmansurjj.vercel.app
(push na `main` publica sozinho pela Vercel). Dado errado ou site quebrado expõe o dono na frente do cliente.

## Como trabalhar

- Autorizado a alterar e publicar sem pedir, **desde que**: revise e teste tudo antes; trabalhe em
  branch + Pull Request (o merge na `main` é a publicação); anote qual versão estava no ar antes;
  se algo quebrar, reverta na hora e conte com franqueza o que aconteceu.
- Consertar o que foi pedido. Conteúdo ou visual novo que ninguém pediu: sugerir primeiro.
- Nunca digitar senha, chave de API ou token. Quem põe é o dono.
- Responder em português do Brasil, simples e direto. O dono costuma ler pelo celular.

## Comandos (obrigatório)

```bash
npm install     # uma vez
npm run build   # compila o CSS, põe código de versão no nome dos arquivos e roda 18 verificações
npm run dev     # servidor local com os mesmos cabeçalhos de segurança da Vercel
```

Não publicar se `npm run build` falhar.

## Regras do código

- Nunca editar `css/style.*.css` direto: mexer em `build/input.css` e rodar o build.
- Nunca `style="..."` nem `<script>` escrito dentro do HTML, e nunca CDN. A segurança do site (CSP)
  bloqueia isso **em silêncio**: o visual quebra sem erro aparente.
- Estética: elemento novo copia as classes de um equivalente que já existe ("tem que manter sempre
  os padrões"). Etiqueta: `inline-block px-3 py-1 rounded-md text-xs font-bold`; a do OPEN MAT
  acrescenta `bg-red-900/50 text-red-200 border border-red-500/50`.
- Segurança: nota A+ 150/150 no MDN HTTP Observatory. Não pode cair.

## Decisões do cliente (não desfazer sem ele pedir)

- Só a unidade da Rua Germano Wendhausen, 259. Não pôr a da Rua Bocaiúva.
- Nada de "Unidade Única e Exclusiva": ele pode abrir outra.
- Topo com o fundo quadriculado escuro. Ele recusou foto de fundo.
- Grade com 6 dias e 15 aulas.

## Armadilhas que já aconteceram

1. `loading="lazy"` dentro de um bloco `data-aos` nunca carrega (o bloco começa invisível). Pegou o mapa.
2. Arquivo com quebra de linha CRLF muda o selo de integridade (SRI): o navegador bloqueia o script
   e a página fica **em branco**. O `.gitattributes` força LF e o `npm run build` confere.
3. Arquivo sem código de versão no nome faz o visitante ver a versão velha por dias. O build resolve.
4. Com script `build` no `package.json`, a Vercel exige `"outputDirectory": "."` no `vercel.json`.
5. `curl` repetido no domínio dispara o anti-robô da Vercel (erro 403). Não é o site caindo.

## Sessão na nuvem (aberta pelo celular, com o PC do dono desligado)

- Dá para: editar, rodar `npm run build`, abrir o PR, esperar o check da Vercel no PR e mesclar.
  Se não conseguir mesclar, peça ao dono para tocar em "Merge" no PR (dá pelo app do GitHub).
- Se não der para conferir o site no ar, diga isso claramente em vez de supor que funcionou.
- O que não der para fazer ou conferir na nuvem: deixe anotado no GitHub (issue, ou PR em rascunho)
  com título começando por **"Fazer no PC:"**, para não se perder.
