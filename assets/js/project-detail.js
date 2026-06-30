/* ============================================================
   LUZEN — Project Detail Choreography
   Sets page flag → main.js cedes scroll animations.
   Owns: hero entrance, parallax, gallery reveals, footer marquee.
   ============================================================ */
window.__LUZEN_PROJECT_SINGLE__ = true;

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initHero();
  initParallax();
  initReveals();
  initFooterMarquee();
});

/* ── Hero — cinematic zoom + staggered meta reveal ───────────── */
function initHero() {
  const img = document.querySelector('.ps-hero__bg img');
  if (!img || !window.gsap) return;

  gsap.to(img, { scale: 1.12, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  const eyebrow = document.querySelector('.ps-hero__eyebrow');
  const title   = document.querySelector('.ps-hero__title');
  const loc     = document.querySelector('.ps-hero__loc');
  const scroll  = document.querySelector('.ps-hero__scroll');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });

  if (eyebrow) tl.fromTo(eyebrow,
    { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85 }, 0.3);
  if (title) tl.fromTo(title,
    { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.15 }, 0.52);
  if (loc) tl.fromTo(loc,
    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75 }, 0.92);
  if (scroll) tl.fromTo(scroll,
    { opacity: 0 }, { opacity: 1, duration: 0.7 }, 1.1);
}

/* ── Parallax — hero + gallery images ────────────────────────── */
function initParallax() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const hero = document.querySelector('.ps-hero');
  const heroImg = document.querySelector('.ps-hero__bg img');
  if (hero && heroImg) {
    gsap.to(heroImg, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.6,
      }
    });
  }

  document.querySelectorAll('.ps-gallery__wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;
    gsap.to(img, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.8,
      }
    });
  });
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  document.body.classList.add('rv-armed');

  const all = [];

  document.querySelectorAll('[data-rv]').forEach(el => {
    if (!el.classList.contains('rv-up') && !el.classList.contains('rv-clip')) {
      el.classList.add('rv-up');
    }
    all.push(el);
  });

  // Meta bar items — stagger across the row
  document.querySelectorAll('.ps-meta__item').forEach((el, i) => {
    el.setAttribute('data-rv', '');
    el.classList.add('rv-up');
    el.style.transitionDelay = (i * 0.07).toFixed(2) + 's';
    all.push(el);
  });

  // Sidebar facts — stagger
  document.querySelectorAll('.ps-fact').forEach((el, i) => {
    el.setAttribute('data-rv', '');
    el.classList.add('rv-up');
    el.style.transitionDelay = (i * 0.08).toFixed(2) + 's';
    all.push(el);
  });

  // Gallery pair images — slight stagger between left and right
  document.querySelectorAll('.ps-gallery__pair .ps-gallery__wrap').forEach((el, i) => {
    el.setAttribute('data-rv', '');
    el.classList.add('rv-up');
    el.style.transitionDelay = (i % 2 === 1 ? 0.14 : 0).toFixed(2) + 's';
    all.push(el);
  });

  // Full gallery images
  document.querySelectorAll('.ps-gallery__full').forEach(el => {
    el.setAttribute('data-rv', '');
    el.classList.add('rv-up');
    all.push(el);
  });

  // Nav items
  document.querySelectorAll('.ps-nav__item').forEach((el, i) => {
    el.setAttribute('data-rv', '');
    el.classList.add('rv-up');
    el.style.transitionDelay = (i * 0.1).toFixed(2) + 's';
    all.push(el);
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

  setTimeout(() => all.forEach(el => el.classList.add('rv-in')), 4500);
}

/* ── Footer marquee ──────────────────────────────────────────── */
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
