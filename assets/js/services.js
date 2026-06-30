/* ============================================================
   LUZEN — Services Page Choreography
   Sets page flag → main.js cedes scroll animations + accordion.
   Owns: hero entrance, GSAP accordion, Why image parallax,
   scroll reveals, footer marquee.
   ============================================================ */
window.__LUZEN_SERVICES__ = true;

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initHero();
  initAccordion();
  initWhyParallax();
  initReveals();
  initFooterMarquee();
});

/* ── Hero — cinematic zoom + staggered reveal ────────────────── */
function initHero() {
  const img  = document.querySelector('.page-header-bg img');
  if (!img || !window.gsap) return;

  gsap.to(img, { scale: 1.13, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  const title = document.querySelector('.page-header-title');
  const crumb = document.querySelector('.page-header .breadcrumb');
  const sub   = document.querySelector('.page-header-sub');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (title) tl.fromTo(title,
    { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.12 }, 0.38);
  if (crumb) tl.fromTo(crumb,
    { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
  if (sub) tl.fromTo(sub,
    { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.86);
}

/* ── Accordion — GSAP-powered premium expand/collapse ────────── */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  // Set the initially open item's body height
  items.forEach(item => {
    const body  = item.querySelector('.accordion-body');
    const inner = item.querySelector('.accordion-body-inner');
    if (!body || !inner) return;

    if (item.classList.contains('is-open')) {
      gsap.set(body, { height: 'auto' });
      // Mark image as already revealed
      const img = item.querySelector('.accordion-body-img');
      if (img) img.classList.add('is-revealed');
    } else {
      gsap.set(body, { height: 0 });
    }
  });

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body   = item.querySelector('.accordion-body');
    const inner  = item.querySelector('.accordion-body-inner');
    const toggle = item.querySelector('.accordion-toggle');
    const imgWrap = item.querySelector('.accordion-body-img');

    if (!header || !body || !inner) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all open items
      items.forEach(other => {
        if (other === item || !other.classList.contains('is-open')) return;
        const otherBody  = other.querySelector('.accordion-body');
        other.classList.remove('is-open');
        if (window.gsap) {
          gsap.to(otherBody, {
            height: 0,
            duration: 0.55,
            ease: 'power3.inOut',
          });
        } else {
          otherBody.style.height = '0px';
        }
      });

      // Toggle this item
      if (isOpen) {
        item.classList.remove('is-open');
        if (window.gsap) {
          gsap.to(body, { height: 0, duration: 0.55, ease: 'power3.inOut' });
        } else {
          body.style.height = '0px';
        }
      } else {
        item.classList.add('is-open');

        if (window.gsap) {
          // Measure natural height
          gsap.set(body, { height: 'auto' });
          const fullH = body.offsetHeight;
          gsap.from(body, {
            height: 0,
            duration: 0.72,
            ease: 'power4.out',
            clearProps: 'height',
          });

          // Stagger text paragraphs
          const paras = inner.querySelectorAll('p');
          gsap.fromTo(paras,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, delay: 0.25 }
          );

          // Image clip-path reveal
          if (imgWrap && !imgWrap.classList.contains('is-revealed')) {
            imgWrap.classList.add('is-revealing');
            gsap.fromTo(imgWrap,
              { clipPath: 'inset(0 100% 0 0)' },
              {
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.9,
                ease: 'power4.out',
                delay: 0.35,
                onComplete: () => imgWrap.classList.add('is-revealed'),
              }
            );
            // Matching scale entrance on img
            const img = imgWrap.querySelector('img');
            if (img) {
              gsap.fromTo(img,
                { scale: 1.12 },
                { scale: 1.06, duration: 1.1, ease: 'power3.out', delay: 0.35 }
              );
            }
          }
        } else {
          body.style.height = inner.offsetHeight + 'px';
        }
      }
    });
  });
}

/* ── Why parallax — slow drift on the image ──────────────────── */
function initWhyParallax() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const wrap = document.querySelector('.svc-why__img-wrap');
  const img  = wrap ? wrap.querySelector('img') : null;
  if (!img) return;

  gsap.to(img, {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.8,
    }
  });
}

/* ── Scroll reveals ─────────────────────────────────────────── */
function initReveals() {
  document.body.classList.add('rv-armed');

  const all = [];

  // Collect explicit data-rv elements
  document.querySelectorAll('[data-rv]').forEach(el => {
    if (!el.classList.contains('rv-up')) el.classList.add('rv-up');
    all.push(el);
  });

  // Intro heading + paragraphs
  document.querySelectorAll('.svc-intro__heading, .svc-intro__p').forEach((el, i) => {
    if (!el.hasAttribute('data-rv')) {
      el.setAttribute('data-rv', '');
      el.classList.add('rv-up');
      el.style.transitionDelay = (i * 0.07).toFixed(2) + 's';
      all.push(el);
    }
  });

  // Why section label + heading
  document.querySelectorAll('.svc-why__label, .svc-why__heading').forEach(el => {
    if (!el.hasAttribute('data-rv')) {
      el.setAttribute('data-rv', '');
      el.classList.add('rv-up');
      all.push(el);
    }
  });

  // Differentiator list items staggered
  document.querySelectorAll('.svc-diff-item').forEach((el, i) => {
    if (!el.hasAttribute('data-rv')) {
      el.setAttribute('data-rv', '');
      el.classList.add('rv-up');
      el.style.transitionDelay = (i * 0.1).toFixed(2) + 's';
      all.push(el);
    }
  });

  // Accordion items stagger
  document.querySelectorAll('.accordion-item').forEach((el, i) => {
    if (!el.hasAttribute('data-rv')) {
      el.setAttribute('data-rv', '');
      el.classList.add('rv-up');
      el.style.transitionDelay = (i * 0.06).toFixed(2) + 's';
      all.push(el);
    }
  });

  // Why image
  const whyImg = document.querySelector('.svc-why__img-col');
  if (whyImg && !whyImg.hasAttribute('data-rv')) {
    whyImg.setAttribute('data-rv', '');
    whyImg.classList.add('rv-up');
    all.push(whyImg);
  }

  // CTA
  const cta = document.querySelector('.page-cta');
  if (cta && !cta.hasAttribute('data-rv')) {
    cta.setAttribute('data-rv', '');
    cta.classList.add('rv-up');
    all.push(cta);
  }

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
