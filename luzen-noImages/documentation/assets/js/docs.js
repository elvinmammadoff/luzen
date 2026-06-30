/* LUZEN Documentation — sidebar scrollspy, copy buttons, mobile menu */
(function () {
  'use strict';

  /* Copy-to-clipboard for code blocks */
  document.querySelectorAll('.code__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code').querySelector('pre');
      var text = pre ? pre.innerText : '';
      navigator.clipboard.writeText(text).then(function () {
        var label = btn.querySelector('.label');
        var prev = label ? label.textContent : '';
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (label) label.textContent = prev || 'Copy';
        }, 1600);
      });
    });
  });

  /* Scrollspy — highlight active nav link */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function spy() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + (current && current.id));
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* Mobile sidebar */
  var sidebar = document.querySelector('.sidebar');
  var btn = document.querySelector('.menu-btn');
  var scrim = document.querySelector('.scrim');
  function toggle(open) {
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
  }
  if (btn) btn.addEventListener('click', function () { toggle(!sidebar.classList.contains('open')); });
  if (scrim) scrim.addEventListener('click', function () { toggle(false); });
  document.querySelectorAll('.nav-list a').forEach(function (a) {
    a.addEventListener('click', function () { if (window.innerWidth <= 980) toggle(false); });
  });
})();
