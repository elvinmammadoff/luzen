/* ============================================================
   LUZEN — Team Details Choreography
   Sets page flag → main.js cedes scroll animations + counters.
   Owns: hero entrance, portrait parallax, scroll reveals,
   footer marquee. Transform/opacity/clip-path only (60fps).
   ============================================================ */
window.__LUZEN_TEAM_DETAILS__ = true;

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initHero();
  initParallax();
  initReveals();
  initSkillBars();
  initMetrics();
  initFooterMarquee();
});

/* ── Hero — staggered text + portrait clip reveal + zoom ─────── */
function initHero() {
  const img = document.querySelector('.td-hero__portrait img');
  if (window.gsap && img) {
    gsap.to(img, { scale: 1.13, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  if (!window.gsap) return;

  const portrait = document.querySelector('.td-hero__portrait');
  const eyebrow  = document.querySelector('.td-hero__eyebrow');
  const name     = document.querySelector('.td-hero__name');
  const bio      = document.querySelector('.td-hero__bio');
  const contact  = document.querySelector('.td-hero__contact');
  const socials  = document.querySelector('.td-hero__socials');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

  if (portrait) tl.fromTo(portrait,
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.out' }, 0);
  if (eyebrow) tl.fromTo(eyebrow,
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.35);
  if (name) tl.fromTo(name,
    { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.05, ease: 'power4.out' }, 0.48);
  if (bio) tl.fromTo(bio,
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85 }, 0.68);
  if (contact) tl.fromTo(contact,
    { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.82);
  if (socials) tl.fromTo(socials,
    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.94);
}

/* ── Parallax — hero portrait (subtle, premium) ──────────────── */
function initParallax() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const portrait = document.querySelector('.td-hero__portrait img');
  if (portrait) {
    gsap.to(portrait, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.td-hero', start: 'top top', end: 'bottom top', scrub: 1.6 },
    });
  }

  // Selected-project images get a whisper of parallax
  document.querySelectorAll('.td-project__img').forEach((wrap) => {
    const img = wrap.querySelector('img');
    if (!img) return;
    gsap.to(img, {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
    });
  });
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  document.body.classList.add('rv-armed');

  const all = [];
  const arm = (el, variant, delay) => {
    if (!el || el.hasAttribute('data-rv')) return;
    el.setAttribute('data-rv', '');
    el.classList.add(variant || 'rv-up');
    if (delay) el.style.transitionDelay = delay.toFixed(2) + 's';
    all.push(el);
  };

  // explicit markup
  document.querySelectorAll('[data-rv]').forEach((el) => {
    if (!el.classList.contains('rv-up') && !el.classList.contains('rv-left') &&
        !el.classList.contains('rv-clip')) el.classList.add('rv-up');
    all.push(el);
  });

  // Metrics (inside overview)
  document.querySelectorAll('.td-metric').forEach((el, i) => arm(el, 'rv-up', i * 0.1));

  // Overview heading
  arm(document.querySelector('.td-overview__title'), 'rv-up', 0);

  // Expertise heading + intro + bullet items
  arm(document.querySelector('.td-expertise__title'), 'rv-up', 0.05);
  arm(document.querySelector('.td-expertise__intro'), 'rv-up', 0.12);
  document.querySelectorAll('.td-expertise__item').forEach((el, i) => arm(el, 'rv-up', (i % 5) * 0.06));
  // Skill bars (width animated by initSkillBars, opacity by reveal)
  document.querySelectorAll('.td-skill-bar').forEach((el, i) => arm(el, 'rv-up', 0.08 + i * 0.07));

  // Practice timeline (inside expertise)
  arm(document.querySelector('.td-ptl__label'), 'rv-up', 0);
  document.querySelectorAll('.td-tl-item').forEach((el, i) => arm(el, 'rv-up', (i % 6) * 0.06));

  // Selected projects
  arm(document.querySelector('.td-projects__title'), 'rv-up', 0);
  document.querySelectorAll('.td-project').forEach((el, i) => arm(el, 'rv-up', i * 0.1));

  // Awards inner (inside projects)
  arm(document.querySelector('.td-awards-inner__head'), 'rv-up', 0);
  document.querySelectorAll('.td-award').forEach((el, i) => arm(el, 'rv-up', (i % 6) * 0.06));
  arm(document.querySelector('.td-awards__press'), 'rv-up', 0.1);

  // Philosophy
  arm(document.querySelector('.td-philosophy__mark'), 'rv-up', 0);
  arm(document.querySelector('.td-philosophy__quote'), 'rv-up', 0.1);
  arm(document.querySelector('.td-philosophy__attr'), 'rv-up', 0.2);
  document.querySelectorAll('.td-philosophy__statement').forEach((el, i) => arm(el, 'rv-up', 0.15 + i * 0.12));

  // CTA
  arm(document.querySelector('.page-cta'), 'rv-up', 0);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  all.forEach((el) => io.observe(el));
  setTimeout(() => all.forEach((el) => el.classList.add('rv-in')), 4500);
}

/* ── Skill bars — bar + synchronized percentage counter ─────── */
function initSkillBars() {
  const skills = document.querySelector('.td-expertise__skills');
  if (!skills) return;
  let fired = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || fired) return;
    fired = true;
    io.disconnect();
    document.querySelectorAll('.td-skill-bar__fill').forEach((fill, i) => {
      const w = parseInt(fill.dataset.w, 10);
      const pctEl = fill.closest('.td-skill-bar').querySelector('.td-skill-bar__pct');
      const delay = 0.1 + i * 0.14;
      if (window.gsap) {
        gsap.fromTo(fill, { width: 0 },
          { width: w + '%', duration: 1.6, delay, ease: 'power3.out' });
        if (pctEl) {
          const proxy = { val: 0 };
          gsap.fromTo(proxy, { val: 0 }, {
            val: w, duration: 1.6, delay, ease: 'power3.out',
            onStart:  () => { pctEl.textContent = '0%'; },
            onUpdate: () => { pctEl.textContent = Math.round(proxy.val) + '%'; }
          });
        }
      } else {
        if (pctEl) pctEl.textContent = w + '%';
        setTimeout(() => {
          fill.style.transition = 'width 1.5s cubic-bezier(0.16,1,0.3,1)';
          fill.style.width = w + '%';
        }, delay * 1000);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.25 });
  io.observe(skills);
}

/* ── Metric counters — count-up on first scroll into view ────── */
function initMetrics() {
  const metrics = document.querySelector('.td-metrics');
  if (!metrics || !window.gsap) return;
  let fired = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || fired) return;
    fired = true;
    io.disconnect();
    document.querySelectorAll('.td-metric__num').forEach((el, i) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const proxy = { val: 0 };
      gsap.fromTo(proxy, { val: 0 }, {
        val: target, duration: 1.4, delay: i * 0.12, ease: 'power2.out',
        onStart:  () => { el.textContent = '0' + suffix; },
        onUpdate: () => { el.textContent = Math.round(proxy.val) + suffix; }
      });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.3 });
  io.observe(metrics);
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
