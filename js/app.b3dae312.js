AOS.init({
  once: true,
  offset: 50,
  duration: 800,
  easing: 'ease-out-cubic'
});

// Carrega o mapa um pouco antes de ele aparecer na tela.
//
// Por que não usamos loading="lazy": o mapa fica dentro de um bloco com animação de
// entrada, que começa em opacity 0. O navegador só busca conteúdo adiado quando ele
// fica visível, e um elemento invisível nunca conta como visível. No celular, o mapa
// simplesmente não começava a carregar.
//
// A decisão de quando carregar é nossa, por dois caminhos independentes:
//   1. IntersectionObserver, que é o jeito eficiente;
//   2. uma conferência de posição a cada rolagem, que funciona em qualquer navegador.
// Os dois chamam a mesma função, e ela só age uma vez. Nada de requestAnimationFrame
// aqui: ele não roda quando a aba está em segundo plano, e o mapa ficaria pendurado.
(function () {
  var mapa = document.querySelector('iframe[data-src]');
  if (!mapa) return;

  var alvo = document.getElementById('localizacao') || mapa;
  var MARGEM = 600; // começa a carregar 600px antes de chegar na tela
  var observador = null;

  function carregar() {
    if (!mapa || mapa.src) return;
    mapa.src = mapa.getAttribute('data-src');
    mapa.removeAttribute('data-src');
    window.removeEventListener('scroll', conferir);
    window.removeEventListener('resize', conferir);
    if (observador) observador.disconnect();
  }

  function conferir() {
    if (mapa.src) return;
    var r = alvo.getBoundingClientRect();
    if (r.top - MARGEM < window.innerHeight && r.bottom + MARGEM > 0) carregar();
  }

  if ('IntersectionObserver' in window) {
    observador = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) return carregar();
      }
    }, { rootMargin: MARGEM + 'px' });
    observador.observe(alvo);
  }

  window.addEventListener('scroll', conferir, { passive: true });
  window.addEventListener('resize', conferir, { passive: true });
  conferir(); // caso a seção já esteja perto quando a página abre
})();
