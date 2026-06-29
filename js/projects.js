/* ============================================================
   LUZEN — Projects Page Choreography
   Sets page flag → main.js cedes scroll animations + counters.
   Owns: hero entrance, filter logic, card reveals, footer marquee.
   ============================================================ */
window.__LUZEN_PROJECTS__ = true;

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initHero();
  initFilter();
  initReveals();
  initFooterMarquee();
});

/* ── Hero — cinematic lifetime zoom + staggered reveal ───────── */
function initHero() {
  const img = document.querySelector('.page-header-bg img');
  if (!img || !window.gsap) return;

  gsap.to(img, { scale: 1.13, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  const title  = document.querySelector('.page-header-title');
  const crumb  = document.querySelector('.page-header .breadcrumb');
  const sub    = document.querySelector('.page-header-sub');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (title) tl.fromTo(title,
    { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.15 }, 0.38);

  if (crumb) tl.fromTo(crumb,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.8 }, 0.68);

  if (sub) tl.fromTo(sub,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.8 }, 0.84);
}

/* ── Filter — smooth GSAP hide/show with stagger ────────────── */
function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.filter-card');
  if (!btns.length || !cards.length) return;

  let active = '*';

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      if (cat === active) return;
      active = cat;

      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const toShow = [];
      const toHide = [];

      cards.forEach(card => {
        const matches = cat === '*' || card.dataset.category === cat;
        if (matches) toShow.push(card);
        else toHide.push(card);
      });

      if (!window.gsap) {
        toHide.forEach(c => { c.style.display = 'none'; });
        toShow.forEach(c => { c.style.display = ''; });
        return;
      }

      // Hide outgoing first
      if (toHide.length) {
        gsap.to(toHide, {
          opacity: 0,
          y: 14,
          scale: 0.97,
          duration: 0.32,
          ease: 'power2.in',
          stagger: 0.04,
          onComplete: () => toHide.forEach(c => c.classList.add('pj-hidden')),
        });
      }

      // Then stagger in the matching cards
      toShow.forEach(c => c.classList.remove('pj-hidden'));
      gsap.fromTo(toShow,
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.065,
          delay: toHide.length ? 0.22 : 0,
          clearProps: 'opacity,transform',
        }
      );
    });
  });
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  document.body.classList.add('rv-armed');

  const targets = [
    '.filter-bar',
    '.filter-card',
    '[data-rv]',
    '.pj-cta',
  ];

  const all = [];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('rv-up')) el.classList.add('rv-up');
      if (!el.hasAttribute('data-rv')) el.setAttribute('data-rv', '');
      // Stagger cards by column position
      if (el.classList.contains('filter-card')) {
        el.style.transitionDelay = ((i % 3) * 0.1).toFixed(2) + 's';
      }
      all.push(el);
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  all.forEach(el => io.observe(el));

  // Safety net — nothing stays hidden
  setTimeout(() => {
    all.forEach(el => el.classList.add('rv-in'));
  }, 4500);
}

/* ── Footer marquee (same as contact.js + homepage) ─────────── */
function initFooterMarquee() {
  const track = document.querySelector('.footer-marquee-track');
  if (!track) return;
  let x = 0;
  const speed = 0.5;
  const totalW = track.scrollWidth / 2;

  (function tick() {
    x -= speed;
    if (Math.abs(x) >= totalW) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  })();
}
