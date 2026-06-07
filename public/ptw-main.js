/* ═══════════════════════════════════════════
   Patagonia Tech Week — Main JS
   ═══════════════════════════════════════════ */

// ── 1. Text Reveal (scroll-driven) ──────────────────────────────────────────
(function () {
  var section   = document.getElementById('text-reveal-section');
  var container = document.getElementById('reveal-text');
  if (!section || !container) return;

  var chunks = [
    'Patagonia Tech Week', 'reúne a', 'emprendedores,', 'inversores,',
    'creadores', 'y líderes tecnológicos', 'para compartir', 'conocimiento,',
    'generar conexiones', 'y construir', 'nuevas oportunidades', 'desde el sur', 'del mundo.'
  ];

  var spans = chunks.map(function (chunk) {
    var sp = document.createElement('span');
    sp.className = 'reveal-word';
    var isUnder = chunk.charAt(0) === '§';
    var text = isUnder ? chunk.slice(1) : chunk;
    sp.textContent = text + ' ';
    if (isUnder) {
      sp.style.textDecoration = 'underline';
      sp.style.textDecorationThickness = '2px';
      sp.style.textUnderlineOffset = '0.18em';
    }
    container.appendChild(sp);
    return sp;
  });

  var N = spans.length, raf = null;
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function update() {
    var rect     = section.getBoundingClientRect();
    var scrolled = -rect.top;
    var range    = section.offsetHeight - window.innerHeight;
    var prog     = Math.max(0, Math.min(1, scrolled / range));
    spans.forEach(function (sp, i) {
      var wordStart = (i / N) * 0.85;
      var wordEnd   = wordStart + 0.18;
      var t = Math.max(0, Math.min(1, (prog - wordStart) / (wordEnd - wordStart)));
      sp.style.opacity = 0.1 + easeInOut(t) * 0.9;
    });
    raf = null;
  }

  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
})();


// ── 2. Click-to-dismiss card stacks ─────────────────────────────────────────
function initClickStack(stackId) {
  var stack = document.getElementById(stackId);
  if (!stack) return;
  var cards = Array.from(stack.querySelectorAll('.click-card'));
  if (!cards.length) return;

  // order[last] = top card
  var order = cards.map(function (_, i) { return i; });
  var baseTransforms = cards.map(function (c) { return c.style.transform; });

  function applyOrder() {
    cards.forEach(function (c) { c.classList.remove('top-card'); c.onclick = null; c.style.cursor = 'default'; });
    order.forEach(function (cardIdx, pos) {
      var c = cards[cardIdx];
      c.style.zIndex = String(pos + 1);
    });
    var topCardIdx = order[order.length - 1];
    var topCard = cards[topCardIdx];
    topCard.classList.add('top-card');
    topCard.onclick = function () {
      var base = baseTransforms[topCardIdx];
      topCard.style.pointerEvents = 'none';
      topCard.animate([
        { transform: base, opacity: '1' },
        { transform: 'translateY(-180px) translateX(80px) rotate(25deg) scale(0.75)', opacity: '0' }
      ], { duration: 520, easing: 'cubic-bezier(0.4,0,0.6,1)', fill: 'forwards' });
      setTimeout(function () {
        // Move flown card to back of stack (becomes bottom) and bring back invisible
        topCard.animate([
          { transform: base, opacity: '0' }
        ], { duration: 0, fill: 'forwards' });
        // Fade it back in
        topCard.animate([
          { opacity: '0' },
          { opacity: '1' }
        ], { duration: 380, easing: 'ease-out', fill: 'forwards' });
        topCard.style.pointerEvents = '';
        order.unshift(order.pop());
        applyOrder();
      }, 520);
    };
  }
  applyOrder();
}
initClickStack('sede-stack');


// ── 2b. Sede appear/vanish (word-by-word scroll-driven) ─────────────────────
(function () {
  var p = document.getElementById('sede-appear');
  if (!p) return;
  var text = p.getAttribute('data-text') || p.textContent;
  p.textContent = '';
  var words = text.split(/\s+/);
  var spans = words.map(function (w) {
    var s = document.createElement('span');
    s.className = 'sede-word';
    s.textContent = w + ' ';
    s.style.opacity = '0.08';
    s.style.transition = 'opacity 0.1s linear';
    p.appendChild(s);
    return s;
  });
  var N = spans.length, raf = null;
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function update() {
    var rect = p.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 when paragraph bottom enters viewport bottom, 1 when paragraph top reaches viewport top
    var visibleStart = vh;
    var visibleEnd = -rect.height;
    var prog = (visibleStart - rect.top) / (visibleStart - visibleEnd);
    prog = Math.max(0, Math.min(1, prog));
    // Map: appear in first 45%, hold to 70%, vanish in last 30%
    spans.forEach(function (sp, i) {
      var wStart = (i / N) * 0.40;
      var wEnd = wStart + 0.18;
      var appear = Math.max(0, Math.min(1, (prog - wStart) / (wEnd - wStart)));
      var vStart = 0.72 + (i / N) * 0.20;
      var vEnd = vStart + 0.10;
      var vanish = Math.max(0, Math.min(1, (prog - vStart) / (vEnd - vStart)));
      var op = 0.08 + easeInOut(appear) * 0.92 - easeInOut(vanish) * 0.92;
      sp.style.opacity = Math.max(0.05, Math.min(1, op));
    });
    raf = null;
  }
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
})();


// ── 3. Vanish on scroll ──────────────────────────────────────────────────────
(function () {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = parseInt(el.style.animationDelay) || 0;
        setTimeout(function () { el.classList.add('revealed'); }, delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.vanish-item').forEach(function (el) { obs.observe(el); });
})();


// ── 4. Animated counters ─────────────────────────────────────────────────────
(function () {
  var fired = false;
  function run(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var start  = performance.now(), dur = 5000;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round((1 - Math.pow(1 - t, 4)) * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var obs = new IntersectionObserver(function (entries) {
    if (fired) return;
    if (entries.some(function (e) { return e.isIntersecting; })) {
      fired = true;
      document.querySelectorAll('.counter').forEach(run);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  var g = document.getElementById('stats-grid');
  if (g) obs.observe(g);
})();


// ── 5. Smooth scroll ─────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});


// ── 6. Registro form ─────────────────────────────────────────────────────────
function handleRegistro(e) {
  e.preventDefault();
  var msg = document.getElementById('registro-msg');
  msg.textContent = '¡Solicitud enviada! Te contactamos pronto.';
  msg.style.opacity = '1';
  e.target.reset();
  setTimeout(function () { msg.style.opacity = '0'; }, 5000);
}


// ── 8. TECH geographic visualization ─────────────────────────────────────────
function initTechGeo() {
  var words = document.querySelectorAll('.tl-word');
  var techWord = null;
  words.forEach(function (w) { if (w.textContent.trim() === 'TECH') techWord = w; });
  if (!techWord) return;

  var ns = 'http://www.w3.org/2000/svg';
  var cs = window.getComputedStyle(techWord);
  var fontSize = parseFloat(cs.fontSize);
  var ls = parseFloat(cs.letterSpacing) || 0; // computed px value

  // Measure exact rendered text width/height at current font size
  var probe = document.createElement('span');
  probe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;' +
    'font-family:"Hanken Grotesk",sans-serif;font-size:' + fontSize + 'px;' +
    'font-weight:700;letter-spacing:' + ls + 'px;white-space:nowrap;line-height:1;';
  probe.textContent = 'TECH';
  document.body.appendChild(probe);
  var W  = probe.offsetWidth;
  var H  = probe.offsetHeight;
  document.body.removeChild(probe);

  // Hanken Grotesk 700: baseline sits ~79% from the top of the em-box
  var BL  = H * 0.79;
  var BW  = Math.round(fontSize * 0.48); // scan beam width

  function mk(tag, attrs) {
    var e = document.createElementNS(ns, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // ── SVG container ─────────────────────────────────────────────────────────
  var svg = mk('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H });
  svg.style.cssText = 'display:block;overflow:visible;';

  var defs = mk('defs', {});
  svg.appendChild(defs);

  // ── Clip path: TECH letter shapes ─────────────────────────────────────────
  var clip = mk('clipPath', { id: 'tg-clip' });
  var clipTxt = mk('text', {
    x: 0, y: BL,
    'font-family': '"Hanken Grotesk", sans-serif',
    'font-size': fontSize,
    'font-weight': '700',
    'letter-spacing': ls
  });
  clipTxt.textContent = 'TECH';
  clip.appendChild(clipTxt);
  defs.appendChild(clip);

  // ── Topo contour filter ───────────────────────────────────────────────────
  // Chain: feTurbulence (stitch) → feTile → feOffset(dx animated) →
  //        desaturate → discrete posterize → edge detect → contrast/blue boost
  var fTopo = mk('filter', {
    id: 'tg-topo', x: '0', y: '0', width: '1', height: '1',
    'color-interpolation-filters': 'sRGB'
  });

  // Noise — stitchTiles makes it seamlessly tileable at element bbox (W×H)
  fTopo.appendChild(mk('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.0072 0.0105',
    numOctaves: '6', seed: '14', stitchTiles: 'stitch', result: 'raw'
  }));

  // Tile the seamless noise infinitely in all directions
  fTopo.appendChild(mk('feTile', { in: 'raw', result: 'tiled' }));

  // Animate dx from 0 → -W: one seamless period = perfectly loop-able
  var feOff = mk('feOffset', { in: 'tiled', dx: '0', dy: '0', result: 'shifted' });
  var driftAnim = mk('animate', {
    attributeName: 'dx',
    from: '0',
    to: String(-W),
    dur: '40s',
    repeatCount: 'indefinite'
  });
  feOff.appendChild(driftAnim);
  fTopo.appendChild(feOff);

  // Desaturate → pure luminance
  fTopo.appendChild(mk('feColorMatrix', { type: 'saturate', values: '0', in: 'shifted', result: 'g' }));

  // Discrete posterize: creates visible contour bands
  var xfer = mk('feComponentTransfer', { in: 'g', result: 'b' });
  var tv = '0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 ' +
           '0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09 0 0.09';
  ['feFuncR', 'feFuncG', 'feFuncB'].forEach(function (tag) {
    xfer.appendChild(mk(tag, { type: 'discrete', tableValues: tv }));
  });
  fTopo.appendChild(xfer);

  // 3×3 Laplacian edge-detect: turns band edges into contour lines
  fTopo.appendChild(mk('feConvolveMatrix', {
    order: '3', kernelMatrix: '-1 -1 -1 -1 8 -1 -1 -1 -1',
    in: 'b', result: 'e', edgeMode: 'wrap'
  }));

  // Boost contrast + slight cool tint (more B channel)
  fTopo.appendChild(mk('feColorMatrix', {
    type: 'matrix',
    values: '7 0 0 0 -0.32  7 0 0 0 -0.28  10 0 0 0 -0.20  0 0 0 30 -5.5',
    in: 'e'
  }));
  defs.appendChild(fTopo);

  // ── Inner glow filter ─────────────────────────────────────────────────────
  var fGlow = mk('filter', { id: 'tg-glow', x: '-40%', y: '-40%', width: '180%', height: '180%' });
  fGlow.appendChild(mk('feGaussianBlur', { stdDeviation: Math.max(3, Math.round(fontSize * 0.038)) }));
  defs.appendChild(fGlow);

  // ── Scan beam gradient ────────────────────────────────────────────────────
  var scanGrad = mk('linearGradient', { id: 'tg-scan', x1: '0', y1: '0', x2: '1', y2: '0' });
  [['0%','0'],['15%','0.55'],['50%','1'],['85%','0.55'],['100%','0']].forEach(function (s) {
    scanGrad.appendChild(mk('stop', { offset: s[0], 'stop-color': 'white', 'stop-opacity': s[1] }));
  });
  defs.appendChild(scanGrad);

  // ── Visual layers (back to front) ─────────────────────────────────────────

  // 1. Soft inner glow — blurred fill, gives letters a lit-from-within feel
  var glowTxt = mk('text', {
    x: 0, y: BL,
    'font-family': '"Hanken Grotesk", sans-serif',
    'font-size': fontSize, 'font-weight': '700', 'letter-spacing': ls,
    fill: 'rgba(185,215,255,0.11)',
    filter: 'url(#tg-glow)'
  });
  glowTxt.textContent = 'TECH';
  svg.appendChild(glowTxt);

  // 2. Clipped group: topo lines + scan beam — both masked to letter shapes
  var clipGrp = mk('g', { 'clip-path': 'url(#tg-clip)' });

  var topoRect = mk('rect', {
    x: 0, y: 0, width: W, height: H,
    fill: 'rgba(215,232,255,1)',
    filter: 'url(#tg-topo)'
  });
  topoRect.style.opacity = '0.26';
  clipGrp.appendChild(topoRect);

  var scanBeam = mk('rect', { x: -BW, y: 0, width: BW, height: H, fill: 'url(#tg-scan)' });
  scanBeam.style.opacity = '0';
  clipGrp.appendChild(scanBeam);

  svg.appendChild(clipGrp);

  // 3. Letter outlines — stroke only, no fill = transparent letters with clean edge
  var outTxt = mk('text', {
    x: 0, y: BL,
    'font-family': '"Hanken Grotesk", sans-serif',
    'font-size': fontSize, 'font-weight': '700', 'letter-spacing': ls,
    fill: 'none',
    stroke: 'rgba(255,255,255,0.86)',
    'stroke-width': '1.3',
    'paint-order': 'stroke fill'
  });
  outTxt.textContent = 'TECH';
  svg.appendChild(outTxt);

  // ── Replace TECH word content with SVG ────────────────────────────────────
  techWord.textContent = '';
  techWord.appendChild(svg);

  // ── Scan line animation: sweeps left→right every ~10s ────────────────────
  var SCAN_DELAY = 10000;
  var SCAN_DUR   = 1900;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function runScan() {
    var start  = performance.now();
    var travel = W + BW * 2;
    function step(now) {
      var t  = Math.min(1, (now - start) / SCAN_DUR);
      var e  = easeInOutCubic(t);
      scanBeam.setAttribute('x', (-BW + travel * e).toFixed(1));
      var op = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;
      scanBeam.style.opacity  = (op * 0.48).toFixed(3);
      topoRect.style.opacity  = (0.26 + op * 0.18).toFixed(3);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        scanBeam.style.opacity = '0';
        topoRect.style.opacity = '0.26';
        setTimeout(runScan, SCAN_DELAY);
      }
    }
    requestAnimationFrame(step);
  }
  setTimeout(runScan, SCAN_DELAY);
}

// ── 7. GSAP Preloader ────────────────────────────────────────────────────────
(function () {
  var preloader = document.getElementById('preloader');
  var stage     = document.getElementById('card-stage');
  if (!preloader || !stage || typeof gsap === 'undefined') return;

  document.body.style.overflow = 'hidden';

  gsap.set(stage,  { xPercent: -50, yPercent: -50 });
  gsap.set('#pl-card-1', { yPercent: 0, opacity: 0, filter: 'blur(10px)' });
  gsap.set('#pl-card-2, #pl-card-3, #pl-card-4, #pl-card-5, #pl-card-6', { yPercent: 100 });
  gsap.set('.tl-word', { yPercent: 108 });
  gsap.set('#pl-hero-coords', { yPercent: 115 });
  gsap.set('#pl-hero-location, #pl-hero-brand', { opacity: 0 });
  gsap.set('#pl-hero-card', { opacity: 0, y: 12 });
  gsap.set('#site-header', { zIndex: 2010, opacity: 0 });

  var tl = gsap.timeline();
  tl.timeScale(0.88);

  // Card 1: fade-in (hacerla visible primero, luego animar)
  tl.set('#pl-card-1', { opacity: 0 }, 0.18);
  tl.to('#pl-card-1',  { opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 0.2);

  // Cards 2-6: hacerlas visibles justo antes de que suban, sin tocar yPercent
  var DUR = 0.62;
  var c2  = 1.35;
  // Intervalos: 0.52 → 0.42 → 0.33 → 0.30  (aceleran pero sin cortar el anteúltimo)
  tl.set('#pl-card-2', { opacity: 1 }, c2 - 0.05);
  tl.set('#pl-card-3', { opacity: 1 }, c2 + 0.47);
  tl.set('#pl-card-4', { opacity: 1 }, c2 + 0.89);
  tl.set('#pl-card-5', { opacity: 1 }, c2 + 1.17);
  tl.set('#pl-card-6', { opacity: 1 }, c2 + 1.42);
  tl.to('#pl-card-2', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2);
  tl.to('#pl-card-3', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 0.52);
  tl.to('#pl-card-4', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 0.94);
  tl.to('#pl-card-5', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 1.22);
  tl.to('#pl-card-6', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 1.47);

  // Expand stage to fullscreen
  tl.to(stage, { width: '100vw', height: '100vh', borderRadius: 0, boxShadow: 'none', duration: 1.1, ease: 'power3.inOut' }, 3.4);
  tl.to(preloader, { backgroundColor: '#060608', duration: 0.7, ease: 'none' }, 3.55);
  tl.to('#pl-overlay', { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 4.85);

  // Build hero over fullscreen stage
  tl.to('#site-header',     { opacity: 1, duration: 0.55, ease: 'power2.out' }, 4.95);
  tl.to('#pl-hero-location',{ opacity: 1, duration: 0.45, ease: 'power2.out' }, 5.15);
  tl.set('#pl-hero-title',  { opacity: 1 }, 5.30);  // visible antes de que suban las palabras
  tl.to('.tl-word',         { yPercent: 0, duration: 0.88, ease: 'power4.out' }, 5.35);
  tl.to('#pl-hero-coords',  { yPercent: 0, duration: 0.65, ease: 'power4.out' }, 5.9);
  tl.to('#pl-hero-brand',   { opacity: 1, duration: 0.4,  ease: 'power2.out' }, 5.95);
  tl.to('#pl-hero-card',    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 6.1);

  // Convert preloader to hero (relative positioning so it flows into page)
  tl.call(function () {
    preloader.style.position = 'relative';
    preloader.style.zIndex   = '1';
    preloader.style.height   = '100vh';
    document.body.style.overflow = '';
    gsap.set('#site-header', { zIndex: 50, clearProps: 'opacity' });
    document.getElementById('site-header').classList.add('visible');
    initTechGeo();
  }, [], 7.0);
})();
