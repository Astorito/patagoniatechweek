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



// ── 8. TECH canvas topo effect ───────────────────────────────────────────────
// Clean sine-wave contour lines drawn on <canvas> and clipped to letter shapes
// via canvas destination-in composite. No SVG filters, no noise/dots.
function initTechGeo() {
  var words = document.querySelectorAll('.tl-word');
  var techWord = null;
  words.forEach(function (w) { if (w.textContent.trim() === 'TECH') techWord = w; });
  if (!techWord) return;

  var cs   = window.getComputedStyle(techWord);
  var fontSize = parseFloat(cs.fontSize);
  var ls   = parseFloat(cs.letterSpacing) || 0; // negative px value

  // Measure rendered dimensions
  var probe = document.createElement('span');
  probe.style.cssText = 'position:fixed;top:-9999px;left:0;visibility:hidden;pointer-events:none;' +
    'font-family:"Hanken Grotesk",sans-serif;font-size:' + fontSize + 'px;' +
    'font-weight:700;letter-spacing:' + ls + 'px;white-space:nowrap;line-height:1;';
  probe.textContent = 'TECH';
  document.body.appendChild(probe);
  var W  = probe.offsetWidth;
  var H  = probe.offsetHeight;
  document.body.removeChild(probe);

  var BL   = H * 0.80;          // baseline (Hanken Grotesk 700 ≈ 80%)
  var FONT = '700 ' + fontSize + 'px "Hanken Grotesk"';

  // ── Canvas ────────────────────────────────────────────────────────────────
  var canvas = document.createElement('canvas');
  canvas.width  = Math.ceil(W);
  canvas.height = Math.ceil(H);
  canvas.style.cssText = 'display:block;';

  techWord.textContent = '';
  techWord.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  ctx.font = FONT;
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';

  // ── Scan line state ──────────────────────────────────────────────────────
  var scan = { active: false, x: -1, op: 0 };
  var SCAN_DELAY = 6000;
  var SCAN_DUR   = 2000;
  var BEAM_W     = Math.round(fontSize * 0.55);

  function easeInOut3(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

  function runScan() {
    var start = performance.now();
    scan.active = true;
    function step(now) {
      var t = Math.min(1, (now - start) / SCAN_DUR);
      scan.x  = -BEAM_W + (W + BEAM_W * 2) * easeInOut3(t);
      scan.op = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;
      if (t < 1) { requestAnimationFrame(step); }
      else { scan.active = false; scan.op = 0; setTimeout(runScan, SCAN_DELAY); }
    }
    requestAnimationFrame(step);
  }
  setTimeout(runScan, SCAN_DELAY);

  // ── Draw loop ─────────────────────────────────────────────────────────────
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // 1. Scan beam (drawn before clip so it's masked to the letter shapes)
    if (scan.active && scan.op > 0) {
      var grad = ctx.createLinearGradient(scan.x - BEAM_W / 2, 0, scan.x + BEAM_W / 2, 0);
      grad.addColorStop(0,   'rgba(255,255,255,0)');
      grad.addColorStop(0.4, 'rgba(255,255,255,' + (scan.op * 0.55).toFixed(3) + ')');
      grad.addColorStop(0.6, 'rgba(255,255,255,' + (scan.op * 0.55).toFixed(3) + ')');
      grad.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // 3. Clip everything drawn so far to the TECH letter shapes
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'white';
    ctx.fillText('TECH', 0, BL);
    ctx.globalCompositeOperation = 'source-over';

    // 4. Letter outlines — thin stroke on top of the clipped content
    ctx.strokeStyle = 'rgba(255,255,255,0.86)';
    ctx.lineWidth   = 1.3;
    ctx.lineJoin    = 'round';
    ctx.strokeText('TECH', 0, BL);

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// Init as soon as fonts are ready — before GSAP fly-up so TECH is already hollow
document.fonts.ready.then(function () { initTechGeo(); });

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
  tl.timeScale(0.80);  // 10% más lento que antes (era 0.88)

  // Card 1: fade-in (hacerla visible primero, luego animar)
  tl.set('#pl-card-1', { opacity: 0 }, 0.18);
  tl.to('#pl-card-1',  { opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 0.2);

  // Cards 2-6: hacerlas visibles justo antes de que suban, sin tocar yPercent
  var DUR = 0.62;
  var c2  = 1.35;
  // Intervalos: 0.52 → 0.42 → 0.35 → 0.32
  tl.set('#pl-card-2', { opacity: 1 }, c2 - 0.05);
  tl.set('#pl-card-3', { opacity: 1 }, c2 + 0.47);
  tl.set('#pl-card-4', { opacity: 1 }, c2 + 0.89);
  tl.set('#pl-card-5', { opacity: 1 }, c2 + 1.24);
  tl.set('#pl-card-6', { opacity: 1 }, c2 + 1.56);
  tl.to('#pl-card-2', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2);
  tl.to('#pl-card-3', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 0.52);
  tl.to('#pl-card-4', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 0.94);
  tl.to('#pl-card-5', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 1.29);
  tl.to('#pl-card-6', { yPercent: 0, duration: DUR, ease: 'power4.out' }, c2 + 1.61);

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
  }, [], 7.0);
})();
