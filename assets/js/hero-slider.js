/* ============================================================
   LUZEN — Hero Slider (Phase 2: premium editorial)
   Layered transition (scale-out → fade → clip reveal → translate
   → staggered text) · gentle lifetime zoom · custom synced nav
   with progress line + next-slide thumbnail · drag + touch.
   Everything (number, line, thumbnail, active, autoplay) is
   updated atomically in render() so it can never desync.
   ============================================================ */

(function () {
  'use strict';

  const root = document.getElementById('hero-slider');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  const slides  = Array.from(root.querySelectorAll('.hs-slide'));
  const total   = slides.length;
  if (total <= 1) return;

  const curEl   = root.querySelector('.hs-num--cur');
  const totEl   = root.querySelector('.hs-num--tot');
  const fillEl  = root.querySelector('.hs-track__fill');
  const prevBtn = root.querySelector('.hs-prev');
  const nextBtn = root.querySelector('.hs-next');
  const nextPrev= root.querySelector('.hs-next-preview');
  const nextThumb = root.querySelector('.hs-next-preview__thumb img');
  const nextTitle = root.querySelector('.hs-next-preview__title');

  const DUR = 6800;            // autoplay duration (ms)
  let index = 0;
  let elapsed = 0;
  let lastTs = null;
  let paused = false;
  let transitioning = false;

  if (totEl) totEl.textContent = String(total).padStart(2, '0');

  /* ── Split titles into masked lines ──────────────────────── */
  slides.forEach((slide) => {
    const title = slide.querySelector('.hs-title');
    if (!title) return;
    const lines = title.innerHTML.split(/<br\s*\/?>/i);
    title.innerHTML = '';
    lines.forEach((line) => {
      const mask = document.createElement('span');
      mask.className = 'hs-line';
      const inner = document.createElement('span');
      inner.innerHTML = line.trim();
      mask.appendChild(inner);
      title.appendChild(mask);
    });
  });

  const parts = (slide) => ({
    media: slide.querySelector('.hs-media'),
    img:   slide.querySelector('.hs-media img'),
    lines: slide.querySelectorAll('.hs-title .hs-line > span'),
    eyebrow: slide.querySelector('.hs-eyebrow'),
    desc:  slide.querySelector('.hs-desc'),
    cta:   slide.querySelector('.hs-cta'),
    extras: slide.querySelectorAll('.hs-card, .hs-thumb, .hs-side-label, .hs-rule'),
  });

  /* ── Atomic nav state — number, line, thumbnail, active ──── */
  function render() {
    if (curEl) curEl.textContent = String(index + 1).padStart(2, '0');

    slides.forEach((s, i) => s.classList.toggle('is-current', i === index));

    const nx = slides[(index + 1) % total];
    if (nextThumb) {
      const src = nx.dataset.thumb;
      if (nextThumb.getAttribute('src') !== src) {
        if (hasGsap && !reduced) {
          gsap.fromTo(nextThumb, { opacity: 0.3, scale: 1.08 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
        }
        nextThumb.src = src;
        nextThumb.alt = nx.dataset.title || '';
      }
    }
    if (nextTitle) nextTitle.textContent = nx.dataset.title || '';
  }

  /* ── Content entrance (overlapping, never all-at-once) ───── */
  function animateContent(slide, tl, t0) {
    const p = parts(slide);
    if (!hasGsap || reduced) {
      p.lines.forEach((l) => (l.style.transform = 'none'));
      [p.eyebrow, p.desc, p.cta, ...p.extras].forEach((e) => e && (e.style.opacity = '1'));
      return;
    }
    gsap.set(p.lines, { yPercent: 115 });
    if (p.eyebrow) gsap.set(p.eyebrow, { opacity: 0, y: 18 });
    if (p.desc) gsap.set(p.desc, { opacity: 0, y: 20 });
    if (p.cta) gsap.set(p.cta, { opacity: 0, y: 20 });
    if (p.extras.length) gsap.set(p.extras, { opacity: 0, y: 26 });

    if (p.eyebrow) tl.to(p.eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, t0);
    tl.to(p.lines, { yPercent: 0, duration: 1.05, stagger: 0.1, ease: 'power4.out' }, t0 + 0.12);
    if (p.desc) tl.to(p.desc, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, t0 + 0.4);
    if (p.cta) tl.to(p.cta, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, t0 + 0.55);
    if (p.extras.length) tl.to(p.extras, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, t0 + 0.65);
  }

  /* ── Gentle 102→105% lifetime zoom (not dramatic Ken Burns) ─ */
  function lifetimeZoom(img) {
    if (!img || !hasGsap || reduced) return;
    gsap.to(img, { scale: 1.05, duration: DUR / 1000 + 1.6, ease: 'none' });
  }

  /* ── Transition ──────────────────────────────────────────── */
  function goTo(next, dir) {
    if (transitioning) return;
    next = (next + total) % total;
    if (next === index) return;
    dir = dir || (next > index ? 1 : -1);

    const cur = slides[index];
    const nx = slides[next];
    const cp = parts(cur), np = parts(nx);

    index = next;
    elapsed = 0;
    render();              // ← nav state updates in lockstep with the slide

    if (!hasGsap || reduced) {
      cur.classList.remove('is-active');
      nx.classList.add('is-active');
      animateContent(nx, null, 0);
      return;
    }

    transitioning = true;
    gsap.killTweensOf([cp.img, np.img]);

    nx.classList.add('is-active');
    gsap.set(nx, { opacity: 1, zIndex: 2 });
    gsap.set(cur, { zIndex: 1 });

    const fromClip = dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
    gsap.set(np.media, { clipPath: fromClip, webkitClipPath: fromClip });
    gsap.set(np.img, { scale: 1.12, x: dir > 0 ? 70 : -70 });

    const tl = gsap.timeline({
      onComplete: () => {
        cur.classList.remove('is-active');
        gsap.set([cur, nx], { clearProps: 'zIndex' });
        gsap.set(cp.img, { x: 0 });
        transitioning = false;
        lifetimeZoom(np.img);
      },
    });

    // 1) outgoing image scales up slightly  2) fades out
    tl.to(cp.img, { scale: 1.06, duration: 1.0, ease: 'power2.inOut' }, 0);
    tl.to(cur, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3);

    // 3) new image revealed by clip-path  4) settles + translates in
    tl.to(np.media, { clipPath: 'inset(0% 0% 0% 0%)', webkitClipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 0.1);
    tl.to(np.img, { scale: 1.02, x: 0, duration: 1.5, ease: 'power3.out' }, 0.1);

    // 5-7) headline → paragraph → buttons (overlapping)
    animateContent(nx, tl, 0.55);
  }

  const goNext = () => goTo(index + 1, 1);
  const goPrev = () => goTo(index - 1, -1);

  /* ── Autoplay progress (rAF, dt-clamped, pause-aware) ────── */
  function tick(ts) {
    if (lastTs == null) lastTs = ts;
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    if (!paused && !transitioning) {
      elapsed += dt;
      const p = Math.min(elapsed / DUR, 1);
      if (fillEl) fillEl.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (p >= 1) goNext();
    }
    requestAnimationFrame(tick);
  }

  function setPaused(state) {
    paused = state;
    const img = parts(slides[index]).img;
    if (img && hasGsap) gsap.globalTimeline.timeScale(1); // keep global running
    if (img) img.style.animationPlayState = state ? 'paused' : 'running';
  }

  /* ── Controls ────────────────────────────────────────────── */
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextPrev) nextPrev.addEventListener('click', goNext);

  root.addEventListener('mouseenter', () => { paused = true; });
  root.addEventListener('mouseleave', () => { paused = false; });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  /* ── Drag + touch ────────────────────────────────────────── */
  let down = false, startX = 0, moved = 0;
  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.hs-nav')) return;
    down = true; startX = e.clientX; moved = 0;
    paused = true;
    root.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => { if (down) moved = e.clientX - startX; });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    root.classList.remove('is-dragging');
    if (Math.abs(moved) > 80) { moved < 0 ? goNext() : goPrev(); }
    paused = false;
  });

  /* ── Boot ────────────────────────────────────────────────── */
  render();
  slides[0].classList.add('is-active');
  // initial content entrance + first lifetime zoom
  if (hasGsap && !reduced) {
    const tl = gsap.timeline({ delay: 0.15, onComplete: () => lifetimeZoom(parts(slides[0]).img) });
    animateContent(slides[0], tl, 0);
  } else {
    animateContent(slides[0], null, 0);
  }
  if (!reduced) requestAnimationFrame(tick);
})();
