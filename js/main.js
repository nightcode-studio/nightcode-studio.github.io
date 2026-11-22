/* NightCode Studio · navegación SPA, idiomas y utilidades */
(function () {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var T = window.NC_I18N || {};
  var LANGS = ['es', 'en'];
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.main a'));
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-btn');
  var langBtn = document.querySelector('.lang-btn');
  var main = document.getElementById('contenido');
  var lang = 'es';
  var currentView = null;
  var first = true;

  // ---------- Idioma ----------
  function t(key) { return (T[lang] && T[lang][key]) || (T.es && T.es[key]) || ''; }

  function savedLang() {
    try { return localStorage.getItem('nc-lang'); } catch (e) { return null; }
  }

  function initialLang() {
    var s = savedLang();
    if (LANGS.indexOf(s) >= 0) return s;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'es';
    return /^es\b/i.test(nav) ? 'es' : 'en';
  }

  function applyLang(code, remember) {
    lang = LANGS.indexOf(code) >= 0 ? code : 'es';
    document.documentElement.lang = lang;
    each('[data-i18n]', function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    each('[data-i18n-html]', function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    each('[data-i18n-attr]', function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    if (langBtn) langBtn.setAttribute('lang', lang === 'es' ? 'en' : 'es');
    setMenuLabel(menu.classList.contains('open'));
    if (currentView) setTitle(currentView);
    if (remember) { try { localStorage.setItem('nc-lang', lang); } catch (e) { /* sin almacenamiento */ } }
    media.onLang();
  }

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  if (langBtn) langBtn.addEventListener('click', function () { applyLang(lang === 'es' ? 'en' : 'es', true); });

  // ---------- Navegación (SPA) ----------
  function setTitle(view) {
    var key = view.getAttribute('data-title-key');
    document.title = 'NightCode Studio · ' + (key ? t(key) : view.dataset.title);
  }

  function route() {
    var path = (location.hash || '#/').replace(/^#/, '') || '/';
    var view = views.filter(function (v) { return v.dataset.route === path; })[0] ||
               views.filter(function (v) { return v.dataset.route === '404'; })[0];
    currentView = view;
    views.forEach(function (v) { v.classList.toggle('active', v === view); });
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    setTitle(view);
    closeMenu();
    media.onRoute(view);
    if (!first) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    first = false;
  }

  function setMenuLabel(open) { menuBtn.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menuOpen')); }
  function closeMenu() { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); setMenuLabel(false); }
  menuBtn.addEventListener('click', function () {
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    setMenuLabel(open);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // ---------- Imagen del juego → vídeo ----------
  // Muestra la captura STILL_MS milisegundos, después reproduce el vídeo y vuelve a empezar.
  var media = (function () {
    var STILL_MS = 3000;
    var box = document.querySelector('[data-media]');
    var video = box && box.querySelector('video');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null;
    var running = false;
    var enabled = !!(video && video.canPlayType && video.canPlayType('video/mp4') && !reduce);

    function stop() {
      running = false;
      clearTimeout(timer);
      if (!enabled) return;
      video.pause();
      box.classList.remove('playing');
    }

    function cycle() {
      clearTimeout(timer);
      box.classList.remove('playing');
      timer = setTimeout(function () {
        if (!running) return;
        var src = video.getAttribute('data-src-' + lang) || video.getAttribute('data-src-es');
        if (video.getAttribute('src') !== src) video.setAttribute('src', src);
        try { video.currentTime = 0; } catch (e) { /* aún sin cargar */ }
        var p = video.play();
        if (p && p.catch) p.catch(function () { stop(); }); // si el navegador bloquea el vídeo, se queda la imagen
      }, STILL_MS);
    }

    function start() {
      if (!enabled || running) return;
      running = true;
      cycle();
    }

    if (enabled) {
      video.addEventListener('playing', function () { if (running) box.classList.add('playing'); });
      video.addEventListener('ended', function () { if (running) cycle(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (currentView && currentView.contains(box)) start();
      });
    }

    return {
      onRoute: function (view) { if (!box) return; if (view.contains(box)) start(); else stop(); },
      onLang: function () { if (running) { stop(); start(); } }
    };
  })();

  // ---------- Año del pie de página: se actualiza solo con la fecha del visitante ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  applyLang(initialLang(), false);
  window.addEventListener('hashchange', route);
  route();
})();
