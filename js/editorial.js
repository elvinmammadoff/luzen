/* ============================================================
   LUZEN — Editorial Interactions
   Service cursor image · thin marquee · video modal ·
   hero intro · parallax · IntersectionObserver reveals + counters

   Reveals use IntersectionObserver (NOT ScrollTrigger) so they
   are immune to stale trigger positions on tall, image-heavy
   pages. A safety timer guarantees content can never stay hidden.
   ============================================================ */

(function () {
  'use strict';

  const coarse  = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO   = 'IntersectionObserver' in window;

  // Signal main.js to stand down on scroll reveals — editorial.js owns
  // entrance animation on this page via the fail-safe IO system below.
  window.__LUZEN_EDITORIAL__ = true;

  /* ── 1. Service cursor-following image ───────────────────── */
  function initServiceHover() {
    const list    = document.querySelector('.service-list');
    const preview = document.getElementById('svc-preview');
    if (!list || !preview || coarse) return;

    const img = preview.querySelector('img');
    let currentSrc = img ? img.src : '';
    let raf = null;
    let mx = 0, my = 0, px = 0, py = 0;

    function tick() {
      px += (mx - px) * 0.1;
      py += (my - py) * 0.1;
      preview.style.left = (px - 130) + 'px';
      preview.style.top  = (py - 170) + 'px';
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

    list.querySelectorAll('.service-list__item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const src = item.dataset.img;
        if (src && img && src !== currentSrc) {
          if (typeof gsap !== 'undefined') {
            gsap.to(img, {
              opacity: 0, duration: 0.18, ease: 'power2.in',
              onComplete: () => {
                img.src = src; currentSrc = src;
                gsap.to(img, { opacity: 1, duration: 0.22, ease: 'power2.out' });
              },
            });
          } else { img.src = src; currentSrc = src; }
        }
        preview.classList.add('is-visible');
        if (!raf) raf = requestAnimationFrame(tick);
      });
      item.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
    });

    list.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));

    const mo = new MutationObserver(() => {
      if (!preview.classList.contains('is-visible') && raf) {
        cancelAnimationFrame(raf); raf = null;
      }
    });
    mo.observe(preview, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── 2. Thin marquee ─────────────────────────────────────── */
  function initThinMarquee() {
    const track = document.getElementById('mt-track');
    if (!track) return;
    const group = track.querySelector('.marquee-thin__group');
    if (!group) return;

    const gw = group.offsetWidth;
    let x = 0, paused = false, last = null;
    const section = track.closest('.marquee-thin');
    if (section) {
      section.addEventListener('mouseenter', () => { paused = true; });
      section.addEventListener('mouseleave', () => { paused = false; });
    }
    function tick(ts) {
      if (last !== null && !paused) {
        x -= (ts - last) / 1000 * 60;
        if (Math.abs(x) >= gw) x += gw;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      last = ts;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── 2b. Clients multi-row marquee (pause on hover) ──────── */
  function initClientsMarquee() {
    const wrap = document.getElementById('clients-marquee');
    if (!wrap) return;

    let paused = false;
    wrap.addEventListener('mouseenter', () => { paused = true; });
    wrap.addEventListener('mouseleave', () => { paused = false; });

    wrap.querySelectorAll('.cm-row').forEach((row) => {
      const track = row.querySelector('.cm-track');
      const group = row.querySelector('.cm-group');
      if (!track || !group) return;

      const dir   = parseFloat(row.dataset.dir || '1');
      const speed = parseFloat(row.dataset.speed || '32');
      const gw    = group.offsetWidth;

      // start a reverse-direction row pre-shifted so it fills from the left
      let x = dir < 0 ? -gw : 0;
      let last = null;

      function tick(ts) {
        if (last !== null && !paused) {
          x -= dir * speed * (ts - last) / 1000;
          if (dir > 0 && Math.abs(x) >= gw) x += gw;
          if (dir < 0 && x >= 0) x -= gw;
          track.style.transform = `translate3d(${x}px,0,0)`;
        }
        last = ts;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ── 2c. Interactive Client Stories ──────────────────────── */
  function initTestimonials() {
    const section = document.getElementById('client-stories');
    if (!section) return;

    const picks = Array.from(section.querySelectorAll('.te-pick'));
    if (!picks.length) return;

    const qEl    = section.querySelector('.te-active__quote');
    const avEl   = section.querySelector('.te-active__avatar');
    const nameEl = section.querySelector('.te-active__name');
    const roleEl = section.querySelector('.te-active__role');

    const DUR = 6000;
    let index = 0;
    let elapsed = 0;
    let lastTs = null;
    let paused = false;

    const authorEl = section.querySelector('.te-active__author');

    function paint(i, animate) {
      const p = picks[i];
      const q = p.dataset.quote, n = p.dataset.name, r = p.dataset.role, img = p.dataset.img;

      // Apply content SYNCHRONOUSLY (no async onComplete → no race with autoplay)
      qEl.textContent = q;
      if (avEl) { avEl.src = img; avEl.alt = n; }
      nameEl.textContent = n;
      roleEl.textContent = r;

      // Fade the new content in
      if (animate && hasGsapSafe() && !reduced) {
        gsap.killTweensOf([qEl, authorEl]);
        gsap.fromTo([qEl, authorEl],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
      }

      picks.forEach((b, bi) => {
        b.classList.toggle('is-active', bi === i);
        b.setAttribute('aria-selected', bi === i ? 'true' : 'false');
        const fill = b.querySelector('.te-pick__bar i');
        if (fill && bi !== i) fill.style.transform = 'scaleX(0)';
      });
    }

    function go(i, animate) {
      index = (i + picks.length) % picks.length;
      elapsed = 0;
      paint(index, animate);
    }

    function tick(ts) {
      if (lastTs == null) lastTs = ts;
      // clamp dt so a throttled/resumed rAF can't skip multiple testimonials
      const dt = Math.min(ts - lastTs, 50); lastTs = ts;
      if (!paused) {
        elapsed += dt;
        const p = Math.min(elapsed / DUR, 1);
        const fill = picks[index].querySelector('.te-pick__bar i');
        if (fill) fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        if (p >= 1) go(index + 1, true);
      }
      requestAnimationFrame(tick);
    }

    picks.forEach((p, i) => {
      p.addEventListener('click', () => go(i, true));
    });

    section.addEventListener('mouseenter', () => { paused = true; });
    section.addEventListener('mouseleave', () => { paused = false; });

    paint(0, false);
    if (!reduced) requestAnimationFrame(tick);
  }

  function hasGsapSafe() { return typeof gsap !== 'undefined'; }

  /* ── 3. Video modal ──────────────────────────────────────── */
  function initVideoModal() {
    const btn = document.getElementById('video-play-btn');
    if (!btn) return;

    const modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.innerHTML = `
      <div class="vm-backdrop"></div>
      <div class="vm-body">
        <button class="vm-close" aria-label="Close">✕</button>
        <div class="vm-frame">
          <iframe src="" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      #video-modal{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity .4s ease,visibility .4s ease}
      #video-modal.open{opacity:1;visibility:visible}
      .vm-backdrop{position:absolute;inset:0;background:rgba(28,28,29,.95);cursor:none}
      .vm-body{position:relative;z-index:1;width:90vw;max-width:1100px}
      .vm-frame{position:relative;padding-top:56.25%}
      .vm-frame iframe{position:absolute;inset:0;width:100%;height:100%}
      .vm-close{position:absolute;top:-44px;right:0;width:36px;height:36px;border:1px solid rgba(255,255,255,.2);background:none;color:#edece8;font-size:1rem;display:flex;align-items:center;justify-content:center;cursor:none;transition:border-color .2s ease,color .2s ease}
      .vm-close:hover{border-color:var(--accent);color:var(--accent)}`;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    const iframe = modal.querySelector('iframe');
    const src = btn.dataset.video || '';
    const open  = () => { iframe.src = src; modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { modal.classList.remove('open'); iframe.src = ''; document.body.style.overflow = ''; };

    btn.addEventListener('click', open);
    modal.querySelector('.vm-backdrop').addEventListener('click', close);
    modal.querySelector('.vm-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── 5. Parallax (scrub — fails safe, only moves Y) ──────── */
  function initParallax() {
    if (typeof ScrollTrigger === 'undefined' || reduced) return;

    const bleedImg = document.querySelector('.project-bleed__img');
    if (bleedImg) {
      gsap.to(bleedImg, {
        y: 60, ease: 'none',
        scrollTrigger: { trigger: '.project-bleed', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      });
    }
  }

  /* ── 6. Reveal system (IntersectionObserver + safety net) ── */
  function initReveals() {
    // [selector, variant, staggerWithinGroup?]
    const groups = [
      ['.project-bleed__caption',   'rv-up'],
      ['.project-bleed__indicator', 'rv-up'],
      ['.ae-left__year',        'rv-up'],
      ['.ae-left__text',        'rv-up', true],
      ['.ae-left__link',        'rv-up'],
      ['.ae-img-primary',       'rv-scale'],
      ['.ae-img-secondary',     'rv-scale'],
      ['.ae-stat',              'rv-up'],
      ['.cs-intro',             'rv-up'],
      /* .cs-item handled by the GSAP counter (lift + count together) */
      ['.service-list__item',   'rv-left', true],
      ['.ps-eyebrow',           'rv-up'],
      ['.ps-quote',             'rv-up'],
      ['.ps-cite',              'rv-up'],
      ['.ps-img',               'rv-scale', true],
      ['.ps-stat',              'rv-up'],
      ['.pe-header',            'rv-up'],
      ['.pe-item',              'rv-up', true],
      ['.te-eyebrow',           'rv-up'],
      ['.te-active',            'rv-up'],
      ['.te-pick',              'rv-up', true],
      ['.je-feature',           'rv-up'],
      ['.je-side__item',        'rv-up', true],
      ['.clients-editorial__title', 'rv-up'],
      ['.clients-editorial__aside', 'rv-up'],
      ['.clients-marquee',          'rv-up'],
      ['.cta-editorial__eyebrow',   'rv-up'],
      ['.cta-editorial__email',     'rv-up'],
      ['.cta-editorial__sub',       'rv-up'],
    ];

    const all = [];
    groups.forEach(([sel, variant, stagger]) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.setAttribute('data-rv', '');
        el.classList.add(variant);
        if (stagger) el.style.transitionDelay = ((i % 8) * 0.07).toFixed(2) + 's';
        all.push(el);
      });
    });

    if (!all.length) return;

    // No-JS-motion path: reveal immediately
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

  /* ── 7. Counters — GSAP + ScrollTrigger, with card lift ──── */
  function initCounters() {
    const strip = document.querySelector('.counter-strip');
    const nums  = document.querySelectorAll('.count-num');
    if (!nums.length) return;

    const items = strip ? Array.from(strip.querySelectorAll('.cs-item')) : [];

    function setFinal() {
      nums.forEach((el) => { el.dataset.counted = '1'; el.textContent = el.dataset.count || el.textContent; });
      if (hasGsapSafe()) gsap.set(items, { clearProps: 'opacity,transform' });
      if (strip) strip.dataset.counted = '1';
    }

    // Fail-safe paths: no GSAP/ScrollTrigger, reduced motion → show finals
    if (!hasGsapSafe() || typeof ScrollTrigger === 'undefined' || reduced || !strip) {
      setFinal();
      return;
    }

    // Pre-hide cards (only with GSAP present → no-JS stays visible)
    gsap.set(items, { opacity: 0, y: 12 });

    function play() {
      if (strip.dataset.counted) return;
      strip.dataset.counted = '1';

      // cards lift 12px upward with a soft fade, gently staggered
      gsap.to(items, {
        opacity: 1, y: 0,
        duration: 0.9, stagger: 0.09, ease: 'power3.out',
      });

      // numbers count up — 2.3s, power2.out, no setInterval, no flicker
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
      trigger: strip,
      start: 'top 82%',
      onEnter: () => {
        // guard against phantom fires before images above have loaded
        // (strip sits high in a short layout → ScrollTrigger thinks it's in view)
        const r = strip.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.95) return;
        play();
      },
    });

    // insurance: if it somehow never triggers, show finals (no snap mid-view)
    setTimeout(() => { if (!strip.dataset.counted) setFinal(); }, 12000);
  }

  /* ── 8. ScrollTrigger refresh (fixes stale positions) ────── */
  function refreshScroll() {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function run() {
    initReveals();
    initCounters();
    initServiceHover();
    initParallax();
    refreshScroll();
    // refresh again once late images settle layout
    setTimeout(refreshScroll, 1200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // These are layout-independent — safe immediately
    initThinMarquee();
    initClientsMarquee();
    initTestimonials();
    initVideoModal();

    // Reveals must not wait on a possibly-missed preloader signal.
    // Run them as soon as DOM is ready; they self-reveal on scroll.
    run();

    // Re-refresh ScrollTrigger after full load (images change height)
    window.addEventListener('load', () => setTimeout(refreshScroll, 200));
  });

})();
