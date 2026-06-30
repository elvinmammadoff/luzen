/* ============================================================
   LUZEN — About Page Interactions
   Owns entrance choreography for about.html (hero timeline,
   fail-safe IntersectionObserver reveals, GSAP counters, story
   motion). Loaded after main.js + effects.js.

   Sets window.__LUZEN_ABOUT__ so main.js stands down on its
   generic scroll reveals + counters — exactly how the homepage
   cedes control to editorial.js. Animations touch only
   transform / opacity / clip-path (60fps, no layout shifts).
   ============================================================ */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO   = 'IntersectionObserver' in window;
  const hasGsap = typeof gsap !== 'undefined';
  const hasST   = typeof ScrollTrigger !== 'undefined';

  // Tell main.js to cede entrance animation + counters to this file.
  window.__LUZEN_ABOUT__ = true;

  /* ── 1. Hero — cinematic background drift + staggered reveal ── */
  function initHero() {
    const header = document.querySelector('.page-header');
    if (!header) return;

    const bg    = header.querySelector('.page-header-bg');
    const img   = header.querySelector('.page-header-bg img');
    const title = header.querySelector('.page-header-title');
    const crumb = header.querySelector('.breadcrumb');
    const sub   = header.querySelector('.page-header-sub');

    if (!hasGsap || reduced) {
      // No-motion path: everything simply visible (CSS defaults).
      return;
    }

    // Slow lifetime zoom — gentle, cinematic, runs for the hero's life.
    if (img) {
      gsap.to(img, { scale: 1.13, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    // Entrance: background reveals first, then title, breadcrumb, sub.
    const tl = gsap.timeline({ delay: 0.15 });

    if (bg) {
      tl.from(bg, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'power3.out' }, 0);
    }
    if (title) {
      tl.from(title, { opacity: 0, y: 46, duration: 1.1, ease: 'power4.out' }, 0.45);
    }
    if (crumb) {
      tl.from(crumb, { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' }, 0.75);
    }
    if (sub) {
      tl.from(sub, { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' }, 0.9);
    }
  }

  /* ── 2. Story — soft parallax + floating secondary image ────── */
  function initStory() {
    if (!hasGsap || reduced) return;

    const secondary = document.querySelector('.about-split-img-stack .img-secondary');
    if (secondary) {
      // continuous gentle float (transform-only)
      gsap.to(secondary, { y: -14, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    if (!hasST) return;
    const primaryImg = document.querySelector('.about-split-img-stack .img-primary img');
    if (primaryImg) {
      gsap.to(primaryImg, {
        yPercent: 6, ease: 'none',
        scrollTrigger: {
          trigger: '.about-split', start: 'top bottom', end: 'bottom top', scrub: 1.5,
        },
      });
    }
  }

  /* ── 3. Reveal system (IntersectionObserver + safety net) ───── */
  function initReveals() {
    // Generic section headers (labels + titles), excluding the hero —
    // its timeline owns those. Story images keep main.js's clip-wipe.
    document.querySelectorAll('.section-label, .section-title').forEach((el) => {
      if (el.closest('.page-header')) return;
      el.setAttribute('data-rv', '');
      el.classList.add('rv-up');
    });

    // [selector, variant, staggerWithinGroup?]
    const groups = [
      ['[data-reveal]',     'rv-up'],
      ['.about-value-item', 'rv-left', true],
      ['.process-step',     'rv-up', true],
      ['.team-card',        'rv-up', true],
      ['.awards-head',      'rv-up'],
      ['.award-card',       'rv-up', true],
      ['.awards-press',     'rv-up'],
      ['.about-cta__inner', 'rv-up'],
    ];

    const all = Array.from(document.querySelectorAll('[data-rv]'));

    groups.forEach(([sel, variant, stagger]) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (!el.hasAttribute('data-rv')) { el.setAttribute('data-rv', ''); all.push(el); }
        el.classList.add(variant);
        if (stagger) el.style.transitionDelay = ((i % 8) * 0.07).toFixed(2) + 's';
      });
    });

    if (!all.length) return;

    // No-JS-motion path: reveal immediately.
    if (reduced || !hasIO) {
      all.forEach((el) => el.classList.add('rv-in'));
      return;
    }

    document.body.classList.add('rv-armed');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('rv-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    all.forEach((el) => io.observe(el));

    // SAFETY NET: nothing may stay hidden, ever.
    setTimeout(() => all.forEach((el) => el.classList.add('rv-in')), 4500);
  }

  /* ── 4. Counters — GSAP + ScrollTrigger, with card lift ─────── */
  function initCounters() {
    const section = document.querySelector('.stats-section');
    const nums    = document.querySelectorAll('.count-num');
    if (!nums.length) return;

    const items = section ? Array.from(section.querySelectorAll('.stats-item')) : [];

    function setFinal() {
      nums.forEach((el) => { el.dataset.counted = '1'; el.textContent = el.dataset.count || el.textContent; });
      if (hasGsap && items.length) gsap.set(items, { clearProps: 'opacity,transform' });
      if (section) section.dataset.counted = '1';
    }

    // Fail-safe: no GSAP/ScrollTrigger or reduced motion → show finals.
    if (!hasGsap || !hasST || reduced || !section) { setFinal(); return; }

    gsap.set(items, { opacity: 0, y: 16 });

    function play() {
      if (section.dataset.counted) return;
      section.dataset.counted = '1';

      gsap.to(items, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });

      nums.forEach((el) => {
        el.dataset.counted = '1';
        const target = parseInt(el.dataset.count || el.textContent, 10);
        if (isNaN(target)) return;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2.3,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v); },
          onComplete: () => { el.textContent = target; },
        });
      });
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top 82%',
      onEnter: () => {
        const r = section.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.95) return;
        play();
      },
    });

    // insurance: if it somehow never triggers, show finals.
    setTimeout(() => { if (!section.dataset.counted) setFinal(); }, 12000);
  }

  function refreshScroll() { if (hasST) ScrollTrigger.refresh(); }

  /* ── Boot ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initStory();
    initReveals();
    initCounters();
    refreshScroll();
    setTimeout(refreshScroll, 1200);
    window.addEventListener('load', () => setTimeout(refreshScroll, 200));
  });

})();
