/* ============================================================
   LUZEN — Main JS
   GSAP + ScrollTrigger + CustomEase + Lenis smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* ── Lenis Smooth Scroll ──────────────────────────────────── */
  function initLenis() {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  /* ── Custom Cursor ────────────────────────────────────────── */
  function initCursor() {
    const dot    = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');

    if (!dot || !circle) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let circleX = 0, circleY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      dot.classList.add('is-hidden');
      circle.classList.add('is-hidden');
    });

    document.addEventListener('mouseenter', () => {
      dot.classList.remove('is-hidden');
      circle.classList.remove('is-hidden');
    });

    const hoverEls = document.querySelectorAll(
      'a, button, .project-card, .blog-card, .team-card, .filter-card, .service-item, .accordion-header, .video-play-btn, .filter-btn'
    );

    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => circle.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => circle.classList.remove('is-hovering'));
    });

    function tick() {
      dotX += (mouseX - dotX) * 0.9;
      dotY += (mouseY - dotY) * 0.9;
      circleX += (mouseX - circleX) * 0.12;
      circleY += (mouseY - circleY) * 0.12;

      // transform-only (GPU composited) — no per-frame layout/repaint
      dot.style.transform    = 'translate3d(' + dotX + 'px,' + dotY + 'px,0) translate(-50%,-50%)';
      circle.style.transform = 'translate3d(' + circleX + 'px,' + circleY + 'px,0) translate(-50%,-50%)';

      requestAnimationFrame(tick);
    }

    tick();
  }

  /* ── Preloader ────────────────────────────────────────────── */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const logoChars = preloader.querySelectorAll('.preloader-logo span');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            initPageAnimations();
          },
        });
      },
    });

    document.body.style.overflow = 'hidden';

    tl.to(logoChars, {
      y: 0,
      duration: 1,
      stagger: 0.06,
      ease: 'power4.out',
      delay: 0.3,
    }).to({}, { duration: 0.8 });
  }

  /* ── Split Text (manual — no GSAP Club needed) ────────────── */
  function splitText(el, type = 'words') {
    // If element has child elements (em, br, strong, etc.), preserve HTML and signal caller
    if (el.children.length > 0) return null;

    const text = el.textContent.trim();
    el.innerHTML = '';

    if (type === 'chars') {
      text.split('').forEach((char) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'split-char';
        const inner = document.createElement('span');
        inner.className = 'split-char-inner';
        inner.textContent = char === ' ' ? ' ' : char;
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      });
      return el.querySelectorAll('.split-char-inner');
    }

    // word split
    text.split(' ').forEach((word, i, arr) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-word';
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';
      const inner = document.createElement('span');
      inner.className = 'split-word-inner';
      inner.style.display = 'inline-block';
      inner.style.transform = 'translateY(110%)';
      inner.textContent = word;
      wrapper.appendChild(inner);
      el.appendChild(wrapper);
      if (i < arr.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });

    return el.querySelectorAll('.split-word-inner');
  }

  /* ── Hero Animations ──────────────────────────────────────── */
  function initHeroAnimations() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const heroTitle = hero.querySelector('.hero-title');
    const heroLabel = hero.querySelector('.hero-label');
    const heroDesc  = hero.querySelector('.hero-desc');
    const heroBtn   = hero.querySelector('.btn-luzen');
    const heroScroll = hero.querySelector('.hero-scroll');
    const heroBg    = hero.querySelector('.hero-bg img');

    const tl = gsap.timeline({ delay: 0.2 });

    if (heroLabel) {
      tl.from(heroLabel, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' });
    }

    if (heroTitle) {
      const words = splitText(heroTitle, 'words');
      if (words) {
        tl.to(words, {
          y: 0,
          duration: 1.2,
          stagger: 0.06,
          ease: 'power4.out',
        }, '-=0.4');
      } else {
        tl.from(heroTitle, { opacity: 0, y: 40, duration: 1.2, ease: 'power4.out' }, '-=0.4');
      }
    }

    if (heroDesc) {
      tl.from(heroDesc, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6');
    }
    if (heroBtn) {
      tl.from(heroBtn, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6');
    }
    if (heroScroll) {
      tl.from(heroScroll, { opacity: 0, duration: 0.8 }, '-=0.4');
    }

    // Parallax on hero bg
    if (heroBg) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          gsap.set(heroBg, {
            y: self.progress * 120,
            scale: 1.08 - self.progress * 0.04,
          });
        },
      });
    }
  }

  /* ── Page Scroll Animations ───────────────────────────────── */
  function initScrollAnimations() {
    // On pages that load editorial.js / about.js, their IntersectionObserver
    // reveal system owns all entrance animation. Bail so we don't double-hide
    // elements with ScrollTrigger from-tweens that may never fire.
    if (window.__LUZEN_EDITORIAL__ || window.__LUZEN_ABOUT__ || window.__LUZEN_CONTACT__ || window.__LUZEN_PROJECTS__ || window.__LUZEN_PROJECT_SINGLE__ || window.__LUZEN_SERVICES__ || window.__LUZEN_TEAM_DETAILS__) return;

    // Section labels
    gsap.utils.toArray('.section-label').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: 'power3.out',
      });
    });

    // Section titles with word split (falls back to fade if HTML children present)
    gsap.utils.toArray('.section-title, .hero-title, .page-header-title').forEach((el) => {
      if (el.closest('#hero')) return;
      const words = splitText(el, 'words');
      if (words) {
        gsap.to(words, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          y: 0,
          duration: 1.1,
          stagger: 0.055,
          ease: 'power4.out',
        });
      } else {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'power4.out',
        });
      }
    });

    // Display headings (large statement text)
    gsap.utils.toArray('.display-1, .display-2, .statement-quote').forEach((el) => {
      if (el.closest('#hero')) return;
      const words = splitText(el, 'words');
      if (words) {
        gsap.to(words, {
          scrollTrigger: { trigger: el, start: 'top 85%' },
          y: 0,
          duration: 1.3,
          stagger: 0.04,
          ease: 'power4.out',
        });
      } else {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%' },
          opacity: 0,
          y: 30,
          duration: 1.1,
          ease: 'power4.out',
        });
      }
    });

    // Image reveals
    gsap.utils.toArray('.img-reveal').forEach((el) => {
      const img = el.querySelector('img');
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power4.out',
      });
      if (img) {
        gsap.to(img, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          scale: 1,
          duration: 1.5,
          ease: 'power4.out',
        });
      }
    });

    // Initialize reveal
    gsap.utils.toArray('.img-reveal').forEach((el) => {
      gsap.set(el, { clipPath: 'inset(0% 100% 0% 0%)' });
    });

    // Fade/slide up generic
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const dir = el.dataset.reveal || 'up';
      const fromVars = {
        opacity: 0,
        y: dir === 'up' ? 40 : dir === 'down' ? -40 : 0,
        x: dir === 'left' ? 40 : dir === 'right' ? -40 : 0,
        duration: 0.9,
        ease: 'power3.out',
      };
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        ...fromVars,
      });
    });

    // Staggered children
    gsap.utils.toArray('[data-stagger]').forEach((container) => {
      const items = container.querySelectorAll('[data-stagger-item]');
      gsap.from(items, {
        scrollTrigger: { trigger: container, start: 'top 82%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    });

    // Project card clip reveals
    gsap.utils.toArray('.project-card, .filter-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%' },
        opacity: 0,
        y: 50,
        duration: 0.9,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
      });
    });

    // Blog cards
    gsap.utils.toArray('.blog-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
      });
    });

    // Service items
    gsap.utils.toArray('.service-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%' },
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });

    // Process steps
    gsap.utils.toArray('.process-step').forEach((step, i) => {
      gsap.from(step, {
        scrollTrigger: { trigger: step, start: 'top 88%' },
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'power3.out',
      });
    });

    // Team cards stagger
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      const cards = teamGrid.querySelectorAll('.team-card');
      gsap.from(cards, {
        scrollTrigger: { trigger: teamGrid, start: 'top 82%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    // About-value items
    gsap.utils.toArray('.about-value-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%' },
        opacity: 0,
        x: -20,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power3.out',
      });
    });

    // Testimonials
    const testiGrid = document.querySelector('.testimonials-grid');
    if (testiGrid) {
      gsap.from(testiGrid.querySelectorAll('.testimonial-card'), {
        scrollTrigger: { trigger: testiGrid, start: 'top 82%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }

    // Stats items
    gsap.utils.toArray('.stats-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%' },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });

    // About snippet image parallax
    const aboutImg = document.querySelector('.about-snippet-image .main-img img');
    if (aboutImg) {
      gsap.to(aboutImg, {
        y: -60,
        scrollTrigger: {
          trigger: '.about-snippet-image',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
        ease: 'none',
      });
    }

    // Background parallax sections
    gsap.utils.toArray('.parallax-bg').forEach((el) => {
      const img = el.querySelector('img');
      if (!img) return;
      gsap.to(img, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // Line reveal (horizontal lines)
    gsap.utils.toArray('.line-reveal').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'power3.out',
      });
    });
  }

  /* ── Counter Animation ────────────────────────────────────── */
  function initCounters() {
    // editorial.js / about.js own counters (GSAP + ScrollTrigger) on their pages.
    if (window.__LUZEN_EDITORIAL__ || window.__LUZEN_ABOUT__ || window.__LUZEN_CONTACT__ || window.__LUZEN_PROJECTS__ || window.__LUZEN_PROJECT_SINGLE__ || window.__LUZEN_SERVICES__ || window.__LUZEN_TEAM_DETAILS__) return;
    gsap.utils.toArray('.count-num').forEach((el) => {
      if (el.dataset.counted) return;

      const target = parseInt(el.dataset.count || el.textContent, 10);
      if (isNaN(target)) return;

      el.textContent = '0';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          if (el.dataset.counted) return;
          el.dataset.counted = '1';
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val);
            },
          });
        },
        once: true,
      });
    });
  }

  /* ── GSAP Marquee ─────────────────────────────────────────── */
  function initMarquee() {
    function setupMarquee(trackEl, speed = 40, direction = 1) {
      if (!trackEl) return;

      const groups = trackEl.querySelectorAll('.marquee-group, .clients-group, .footer-marquee-group');
      if (!groups.length) return;

      const groupWidth = groups[0].offsetWidth;
      let xOffset = 0;
      let paused = false;

      const section = trackEl.closest('.marquee-section, .clients-marquee, .footer-marquee-strip');
      if (section) {
        section.addEventListener('mouseenter', () => { paused = true; });
        section.addEventListener('mouseleave', () => { paused = false; });
      }

      let lastTime = null;

      function tick(timestamp) {
        if (lastTime !== null && !paused) {
          const delta = (timestamp - lastTime) / 1000;
          xOffset -= direction * speed * delta;
          if (Math.abs(xOffset) >= groupWidth) {
            xOffset += direction * groupWidth;
          }
          gsap.set(trackEl, { x: xOffset });
        }
        lastTime = timestamp;
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    setupMarquee(document.querySelector('.marquee-track'), 55);
    setupMarquee(document.querySelector('.clients-track'), 40);
    setupMarquee(document.querySelector('.footer-marquee-track'), 30);
  }

  /* ── 3D Card Tilt ─────────────────────────────────────────── */
  function initTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -8;
        const rotY = ((x - cx) / cx) * 8;

        gsap.to(card, {
          rotationX: rotX,
          rotationY: rotY,
          transformPerspective: 800,
          duration: 0.5,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });
  }

  /* ── Navigation ───────────────────────────────────────────── */
  function initNav() {
    const header = document.getElementById('header');
    if (!header) return;

    // Scroll state
    ScrollTrigger.create({
      start: 80,
      onUpdate: (self) => {
        header.classList.toggle('scrolled', self.scroll() > 80);
      },
    });

    // Hamburger + mobile menu
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is-open');
        mobileMenu.classList.toggle('is-open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';

        if (isOpen) {
          gsap.from(mobileLinks, {
            opacity: 0,
            x: -30,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power3.out',
            delay: 0.2,
          });
        }
      });

      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('is-open');
          mobileMenu.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active nav link
    const navLinks = document.querySelectorAll('.header-nav a, .mobile-menu-links a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Accordion (Services page) ────────────────────────────── */
  function initAccordion() {
    if (window.__LUZEN_SERVICES__) return; // services.js owns this
    const items = document.querySelectorAll('.accordion-item');

    items.forEach((item) => {
      const header = item.querySelector('.accordion-header');
      const body   = item.querySelector('.accordion-body');
      const inner  = item.querySelector('.accordion-body-inner');

      if (!header || !body) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all
        items.forEach((i) => {
          i.classList.remove('is-open');
          const b = i.querySelector('.accordion-body');
          if (b) b.style.height = '0px';
        });

        // Open clicked
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.height = (inner ? inner.offsetHeight : 0) + 'px';
        }
      });
    });
  }

  /* ── Project Filter ───────────────────────────────────────── */
  function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterCards = document.querySelectorAll('.filter-card');

    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        filterCards.forEach((card) => {
          const category = card.dataset.category;
          const show = filter === '*' || category === filter;

          gsap.to(card, {
            opacity: show ? 1 : 0.2,
            scale: show ? 1 : 0.96,
            duration: 0.4,
            ease: 'power2.out',
          });

          card.style.pointerEvents = show ? 'auto' : 'none';
        });
      });
    });
  }

  /* ── Video Modal ──────────────────────────────────────────── */
  function initVideoModal() {
    const playBtn = document.querySelector('.video-play-btn');
    if (!playBtn) return;

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="video-modal-backdrop"></div>
      <div class="video-modal-inner">
        <button class="video-modal-close" aria-label="Close">&times;</button>
        <div class="video-modal-frame">
          <iframe src="" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
      </div>
    `;

    const styles = `
      .video-modal { position: fixed; inset: 0; z-index: 9990; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.4s ease, visibility 0.4s ease; }
      .video-modal.is-open { opacity: 1; visibility: visible; }
      .video-modal-backdrop { position: absolute; inset: 0; background: rgba(12,12,12,0.95); }
      .video-modal-inner { position: relative; z-index: 1; width: 90vw; max-width: 1100px; }
      .video-modal-frame { position: relative; padding-top: 56.25%; background: #000; }
      .video-modal-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
      .video-modal-close { position: absolute; top: -50px; right: 0; width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.2); color: #f5f2ed; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; background: none; cursor: none; transition: border-color 0.2s ease, color 0.2s ease; }
      .video-modal-close:hover { border-color: #c4a76b; color: #c4a76b; }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
    document.body.appendChild(modal);

    const iframe = modal.querySelector('iframe');
    const closeBtn = modal.querySelector('.video-modal-close');
    const backdrop = modal.querySelector('.video-modal-backdrop');
    const videoSrc = playBtn.dataset.video || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

    function openModal() {
      iframe.src = videoSrc;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    playBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ── Page Transition ──────────────────────────────────────── */
  function initPageTransition() {
    const curtain = document.createElement('div');
    curtain.id = 'page-curtain';
    Object.assign(curtain.style, {
      position: 'fixed',
      inset: '0',
      background: 'var(--dark)',
      zIndex: '9997',
      transform: 'scaleX(0)',
      transformOrigin: 'right',
    });
    document.body.appendChild(curtain);

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http')) return;
      if (link.target === '_blank') return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(curtain, {
          scaleX: 1,
          transformOrigin: 'left',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            window.location.href = href;
          },
        });
      });
    });

    // Reveal on load
    gsap.set(curtain, { scaleX: 1, transformOrigin: 'right' });
    gsap.to(curtain, {
      scaleX: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      delay: 0.1,
    });
  }

  /* ── About Page specific ──────────────────────────────────── */
  function initAboutPage() {
    const aboutSplit = document.querySelector('.about-split');
    if (!aboutSplit) return;

    const imgPrimary = aboutSplit.querySelector('.img-primary');
    const imgSecondary = aboutSplit.querySelector('.img-secondary');

    if (imgPrimary) {
      gsap.from(imgPrimary, {
        scrollTrigger: { trigger: imgPrimary, start: 'top 85%' },
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.2,
        ease: 'power4.out',
      });
      gsap.from(imgPrimary.querySelector('img'), {
        scrollTrigger: { trigger: imgPrimary, start: 'top 85%' },
        scale: 1.12,
        duration: 1.5,
        ease: 'power4.out',
      });
    }

    if (imgSecondary) {
      gsap.from(imgSecondary, {
        scrollTrigger: { trigger: imgSecondary, start: 'top 88%' },
        clipPath: 'inset(100% 0 0 0)',
        duration: 1,
        ease: 'power4.out',
        delay: 0.3,
      });
    }
  }

  /* ── Page animations (after preloader) ───────────────────── */
  function initPageAnimations() {
    initScrollAnimations();
    initCounters();
    initMarquee();
    initTilt();
    initAccordion();
    initProjectFilter();
    initVideoModal();
    initAboutPage();
    AOS.refresh();
  }

  /* ── Init ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // AOS
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: 'mobile',
      });
    }

    // GSAP defaults
    gsap.defaults({ ease: 'power3.out' });

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof CustomEase !== 'undefined') {
      gsap.registerPlugin(CustomEase);
      CustomEase.create('smooth', '.25, .1, .25, 1');
    }

    // Lenis
    if (typeof Lenis !== 'undefined') {
      window._lenis = initLenis();
    }

    // Core
    initCursor();
    initNav();
    initHeroAnimations();
    initPageTransition();

    // Preloader (if exists) or run immediately
    const preloader = document.getElementById('preloader');
    if (preloader) {
      initPreloader();
    } else {
      initPageAnimations();
    }
  });
})();
