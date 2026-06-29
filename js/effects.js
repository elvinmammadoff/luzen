/* ============================================================
   LUZEN — Realism / Craft Layer
   WebGL displacement hover · magnetic buttons · char split ·
   flip-in cards · cursor labels · grain
   Loaded AFTER main.js. Degrades gracefully.
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let hasLuzenEase = false;

  /* ──────────────────────────────────────────────────────────
     1. WebGL Displacement Hover (the signature "not-AI" effect)
     Applies a liquid distortion to images on hover using a
     procedurally generated noise displacement map. No external
     hover-effect library — a self-contained Three.js shader so
     there are no version conflicts.
     Markup: <div class="gl-hover"><img src="..."></div>
     ────────────────────────────────────────────────────────── */
  function initWebGLHover() {
    if (typeof THREE === 'undefined' || coarse || reduceMotion) return;

    // Build a soft noise displacement map once, shared by all instances.
    const dispCanvas = document.createElement('canvas');
    dispCanvas.width = dispCanvas.height = 256;
    const dctx = dispCanvas.getContext('2d');
    dctx.fillStyle = '#808080';
    dctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 30 + Math.random() * 80;
      const g = dctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = Math.random() > 0.5 ? 255 : 0;
      g.addColorStop(0, `rgba(${tone},${tone},${tone},0.5)`);
      g.addColorStop(1, 'rgba(128,128,128,0)');
      dctx.fillStyle = g;
      dctx.fillRect(0, 0, 256, 256);
    }
    const dispTex = new THREE.CanvasTexture(dispCanvas);
    dispTex.wrapS = dispTex.wrapT = THREE.RepeatWrapping;

    const vertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragment = `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform sampler2D uDisp;
      uniform float uHover;       // 0..1 eased
      uniform float uTime;
      uniform vec2  uUvScale;
      uniform vec2  uUvOffset;

      void main() {
        // cover-fit uv
        vec2 uv = vUv * uUvScale + uUvOffset;

        // animated displacement sample
        vec2 dUv = uv + vec2(uTime * 0.02, 0.0);
        float disp = texture2D(uDisp, dUv).r - 0.5;

        float amt = uHover * 0.16;
        // chromatic split driven by displacement
        vec2 uvR = uv + vec2(disp * amt * 1.0, disp * amt * 0.4);
        vec2 uvG = uv + vec2(disp * amt * 0.6, disp * amt * 0.6);
        vec2 uvB = uv + vec2(disp * amt * 0.2, disp * amt * 0.8);

        float r = texture2D(uTexture, uvR).r;
        float g = texture2D(uTexture, uvG).g;
        float b = texture2D(uTexture, uvB).b;

        // subtle warm lift on hover (toward gold) for cohesion
        vec3 col = vec3(r, g, b);
        col = mix(col, col * vec3(1.06, 1.0, 0.9), uHover * 0.25);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const loader = new THREE.TextureLoader();

    document.querySelectorAll('.gl-hover').forEach((wrap) => {
      const img = wrap.querySelector('img');
      if (!img) return;

      const src = img.currentSrc || img.src;
      let rect = wrap.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;

      // Hide the DOM image; canvas takes over but img stays for SEO/no-JS.
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(rect.width, rect.height);
      const canvas = renderer.domElement;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.4s ease';
      wrap.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10, 10);
      camera.position.z = 1;

      const uniforms = {
        uTexture: { value: null },
        uDisp:    { value: dispTex },
        uHover:   { value: 0 },
        uTime:    { value: 0 },
        uUvScale:  { value: new THREE.Vector2(1, 1) },
        uUvOffset: { value: new THREE.Vector2(0, 0) },
      };

      const mat = new THREE.ShaderMaterial({
        uniforms, vertexShader: vertex, fragmentShader: fragment,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      scene.add(mesh);

      function computeCover(tex) {
        const iw = tex.image.width, ih = tex.image.height;
        const ir = iw / ih;
        const cr = rect.width / rect.height;
        let sx = 1, sy = 1;
        if (ir > cr) { sx = cr / ir; } else { sy = ir / cr; }
        uniforms.uUvScale.value.set(sx, sy);
        uniforms.uUvOffset.value.set((1 - sx) / 2, (1 - sy) / 2);
      }

      loader.load(src, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        uniforms.uTexture.value = tex;
        computeCover(tex);
        canvas.style.opacity = '1';
        img.style.opacity = '0';
      });

      let hoverTarget = 0;
      let raf = null;
      let running = false;

      function render(t) {
        uniforms.uTime.value = t * 0.001;
        uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.08;
        renderer.render(scene, camera);
        if (running || uniforms.uHover.value > 0.001) {
          raf = requestAnimationFrame(render);
        } else {
          raf = null;
        }
      }
      function ensureLoop() { if (!raf) raf = requestAnimationFrame(render); }

      wrap.addEventListener('mouseenter', () => { hoverTarget = 1; running = true; ensureLoop(); });
      wrap.addEventListener('mouseleave', () => { hoverTarget = 0; running = false; ensureLoop(); });

      // Resize handling
      const ro = new ResizeObserver(() => {
        rect = wrap.getBoundingClientRect();
        if (rect.width < 4) return;
        renderer.setSize(rect.width, rect.height);
        if (uniforms.uTexture.value) computeCover(uniforms.uTexture.value);
        ensureLoop();
      });
      ro.observe(wrap);

      // initial paint
      ensureLoop();
    });
  }

  /* ──────────────────────────────────────────────────────────
     2. Magnetic buttons — cursor attraction
     Markup: add class "magnetic"
     ────────────────────────────────────────────────────────── */
  function initMagnetic() {
    if (coarse || reduceMotion || typeof gsap === 'undefined') return;

    document.querySelectorAll('.magnetic').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic || '0.35');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. Char-level masked split headings
     Markup: class "split-chars" (no inner HTML children)
     ────────────────────────────────────────────────────────── */
  function splitToChars(el) {
    if (el.children.length > 0) return null;
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text.trim());
    const out = [];
    text.split('').forEach((ch) => {
      if (ch === ' ') { el.appendChild(document.createTextNode(' ')); return; }
      const mask = document.createElement('span');
      mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
      const inner = document.createElement('span');
      inner.style.cssText = 'display:inline-block;transform:translateY(115%);will-change:transform;';
      inner.setAttribute('aria-hidden', 'true');
      inner.textContent = ch;
      mask.appendChild(inner);
      el.appendChild(mask);
      out.push(inner);
    });
    return out;
  }

  function initCharSplits() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.split-chars').forEach((el) => {
      const chars = splitToChars(el);
      if (!chars) return;
      gsap.to(chars, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        y: 0,
        duration: 1,
        stagger: 0.022,
        ease: hasLuzenEase ? 'luzen' : 'power4.out',
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     4. Flip-in cards (bw-item-flip-in equivalent)
     Markup: class "flip-in" (optionally inside [data-flip-group])
     ────────────────────────────────────────────────────────── */
  function initFlipIn() {
    if (typeof gsap === 'undefined') return;
    gsap.utils.toArray('.flip-in').forEach((el, i) => {
      gsap.set(el, { transformPerspective: 900, transformOrigin: 'center bottom' });
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        rotateX: -45,
        y: 60,
        opacity: 0,
        duration: 1,
        delay: (i % 3) * 0.08,
        ease: 'power3.out',
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     5. Masked line reveal for paragraphs (bw-reveal-text)
     Markup: class "reveal-lines"
     ────────────────────────────────────────────────────────── */
  function initLineReveal() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.reveal-lines').forEach((el) => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 0 100% 0)', opacity: 0.2 },
        {
          clipPath: 'inset(0 0 0% 0)', opacity: 1,
          duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        }
      );
    });
  }

  /* ──────────────────────────────────────────────────────────
     6. Cursor contextual labels ("View" on projects, "Drag" etc.)
     ────────────────────────────────────────────────────────── */
  function initCursorLabels() {
    if (coarse) return;
    const circle = document.querySelector('.cursor-circle');
    if (!circle) return;

    let label = circle.querySelector('.cursor-label');
    if (!label) {
      label = document.createElement('span');
      label.className = 'cursor-label';
      circle.appendChild(label);
    }

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        circle.classList.add('has-label');
        label.textContent = el.dataset.cursor;
      });
      el.addEventListener('mouseleave', () => {
        circle.classList.remove('has-label');
        label.textContent = '';
      });
    });
  }

  /* ── Init after preloader / load ──────────────────────────── */
  function start() {
    // Register a proper editorial ease if CustomEase present
    if (typeof CustomEase !== 'undefined' && typeof gsap !== 'undefined') {
      try { CustomEase.create('luzen', 'M0,0 C0.16,1 0.3,1 1,1'); hasLuzenEase = true; } catch (e) {}
    }
    initCharSplits();
    initFlipIn();
    initLineReveal();
    initMagnetic();
    initCursorLabels();
    initWebGLHover();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }

  // Wait for fonts + a tick so layout is settled (WebGL needs real rects).
  if (document.readyState === 'complete') {
    setTimeout(start, 300);
  } else {
    window.addEventListener('load', () => setTimeout(start, 300));
  }
})();
