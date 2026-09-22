# Rafael Mansur Jiu-Jitsu School

Landing page da escola de Jiu-Jitsu do professor Rafael Mansur, no Centro de Florianópolis (SC).
Site estático (HTML + Tailwind compilado), publicado na Vercel.

## Como mexer no site

Instale as dependências uma vez:

```bash
npm install
```

O CSS é **compilado** (não use CDN). Depois de mexer em `index.html` ou em `build/input.css`,
gere o CSS de novo:

```bash
npm run build:css
```

Para ficar recompilando enquanto edita:

```bash
npm run watch:css
```

Para ver o site localmente **com os mesmos cabeçalhos de segurança da Vercel**:

```bash
npm run dev
```

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | A página inteira |
| `build/input.css` | CSS de origem (fontes, componentes, ajustes) |
| `css/style.css` | CSS final compilado — **não editar à mão** |
| `tailwind.config.js` | Tema: fontes, cores e animações |
| `fonts/` | Fontes do próprio site (Outfit e Playfair Display) |
| `js/aos.js`, `js/app.js` | Animações de entrada |
| `vercel.json` | Cabeçalhos de segurança e cache |

## Segurança

O site segue o padrão A+ (150/150) do [MDN HTTP Observatory](https://developer.mozilla.org/en-US/observatory).

Regras que **não podem ser quebradas**:

- **Nada de script ou estilo inline.** A política de segurança (CSP) usa `default-src 'none'`
  e bloqueia qualquer `<script>` escrito dentro do HTML e qualquer `style="..."`.
  Se precisar de estilo novo, coloque em `build/input.css` e recompile.
- **Nada de CDN.** Tailwind, fontes e bibliotecas ficam hospedados aqui mesmo.
- **Ao trocar um arquivo em `js/`**, rode `npm run sri` para recalcular os hashes de integridade.
- **Ao mexer no bloco de dados estruturados** (`application/ld+json` no `index.html`),
  recalcule o hash e atualize em `vercel.json`:

  ```bash
  node -e "const c=require('crypto'),f=require('fs');const m=f.readFileSync('index.html','utf8').match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1],'utf8').digest('base64'))"
  ```

Antes de publicar, rode o scanner oficial contra o servidor local (precisa do `npm run dev` rodando):

```bash
npm run security:scan
```

## Antes de publicar (obrigatório)

```bash
npm run check
```

Confere a integridade dos scripts, o hash dos dados estruturados, a ausência de
código inline e a quebra de linha dos arquivos.

> **Por que a quebra de linha importa:** o hash de integridade é calculado sobre os
> bytes exatos do arquivo. Se o arquivo estiver com CRLF (Windows) na sua máquina e
> o servidor entregar com LF, o navegador **bloqueia o script** e a página fica em
> branco. O `.gitattributes` força LF em tudo; o `npm run check` confirma.
