/* ============================================================
   LUZEN — Contact Page Choreography
   Mirrors the about.js pattern — sets the page flag, owns all
   entrance animations and micro-interactions for contact.html.
   ============================================================ */
window.__LUZEN_CONTACT__ = true;

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  initHero();
  initStudio();
  initReveals();
  initFormInteractions();
  initFooterMarquee();
});

/* ── Hero — cinematic lifetime zoom + staggered reveal ───────── */
function initHero() {
  const img = document.querySelector('.page-header-bg img');
  if (!img || !window.gsap) return;

  gsap.to(img, { scale: 1.13, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  const title      = document.querySelector('.page-header-title');
  const breadcrumb = document.querySelector('.page-header .breadcrumb');
  const sub        = document.querySelector('.page-header-sub');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (title) tl.fromTo(title,
    { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.1 }, 0.42);

  if (breadcrumb) tl.fromTo(breadcrumb,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.8 }, 0.72);

  if (sub) tl.fromTo(sub,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.8 }, 0.88);
}

/* ── Studio Showcase — parallax scrub + lifetime zoom ────────── */
function initStudio() {
  const wrap = document.querySelector('.contact-studio__img-wrap');
  const img  = wrap ? wrap.querySelector('img') : null;
  if (!img || !window.gsap) return;

  // Parallax scrub
  gsap.to(img, {
    yPercent: -9,
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.8
    }
  });

  // Slow lifetime zoom
  gsap.fromTo(img,
    { scale: 1.07 },
    { scale: 1.13, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 }
  );
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  document.body.classList.add('rv-armed');

  const selectors = [
    '[data-rv]',
    '.ct-item',
    '.contact-studio__caption'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('rv-up')) el.classList.add('rv-up');
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  document.querySelectorAll('[data-rv], .ct-item, .contact-studio__caption').forEach(el => io.observe(el));

  // Safety timer — nothing stays hidden if observer misfires
  setTimeout(() => {
    document.querySelectorAll('[data-rv], .ct-item, .contact-studio__caption')
      .forEach(el => el.classList.add('rv-in'));
  }, 4500);
}

/* ── Form micro-interactions ─────────────────────────────────── */
function initFormInteractions() {
  // Textarea auto-height
  const ta = document.querySelector('.ct-textarea');
  if (ta) {
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  // Label colour pulse on input
  document.querySelectorAll('.ct-input, .ct-select').forEach(input => {
    input.addEventListener('change', () => {
      const label = input.closest('.ct-field')?.querySelector('.ct-label');
      if (label && input.value) label.style.color = 'var(--muted-lt)';
    });
  });
}

/* ── Footer marquee (same helper as homepage) ────────────────── */
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
