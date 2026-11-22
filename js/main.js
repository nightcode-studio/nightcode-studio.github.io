/* NightCode Studio · navegación SPA y utilidades */
(function () {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.main a'));
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-btn');
  var main = document.getElementById('contenido');
  var first = true;

  function route() {
    var path = (location.hash || '#/').replace(/^#/, '') || '/';
    var view = views.filter(function (v) { return v.dataset.route === path; })[0] ||
               views.filter(function (v) { return v.dataset.route === '404'; })[0];
    views.forEach(function (v) { v.classList.toggle('active', v === view); });
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = 'NightCode Studio · ' + view.dataset.title;
    closeMenu();
    if (!first) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    first = false;
  }

  function closeMenu() { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menú'); }
  menuBtn.addEventListener('click', function () {
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });


  // Año del pie de página: se actualiza solo con la fecha del visitante
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  window.addEventListener('hashchange', route);
  route();
})();
