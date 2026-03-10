/* ============================================================
   RAD 2.0 — ctf.cyberzee.space
   Landing Page JS
   Canvas: Stars + Drifting Particles + Nebulae + Orbital Rings
   Countdown | Card Tilt | Nav | Scroll Reveal
   ============================================================ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════
     CANVAS BACKGROUND
     Unified canvas — stars, particles,
     nebulae, constellation lines, orbital rings
  ═══════════════════════════════════════ */
  var canvas = document.getElementById('particleCanvas');
  var ctx    = canvas.getContext('2d');
  var W, H;
  var stars      = [];
  var particles  = [];
  var rings      = [];
  var nebulaBg   = null;

  var STAR_COUNT     = 260;
  var PARTICLE_COUNT = 80;
  var CONNECT_DIST   = 90;
  var MOUSE_RADIUS   = 130;
  var mouse          = { x: -9999, y: -9999 };

  // FPS cap — 40 is sweet spot for Vercel static (client GPU only)
  var TARGET_FPS     = 40;
  var FRAME_INTERVAL = 1000 / TARGET_FPS;
  var lastFrame      = 0;
  var t              = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNebulae();
    buildStars();
    buildParticles();
    buildRings();
  }

  /* ── Nebulae: painted once to offscreen canvas ── */
  function buildNebulae() {
    nebulaBg = document.createElement('canvas');
    nebulaBg.width  = W;
    nebulaBg.height = H;
    var nc = nebulaBg.getContext('2d');

    paintNebula(nc, W * 0.15, H * 0.20, 380, 200, 200, 168, 75,  0.025);
    paintNebula(nc, W * 0.80, H * 0.70, 300, 180, 70,  110, 220, 0.018);
    paintNebula(nc, W * 0.65, H * 0.30, 220, 130, 200, 168, 75,  0.015);
    paintNebula(nc, W * 0.30, H * 0.80, 260, 160, 100, 60,  200, 0.010);
  }

  function paintNebula(nc, cx, cy, rx, ry, r, g, b, a) {
    nc.save();
    nc.translate(cx, cy);
    nc.scale(1, ry / rx);
    var g2 = nc.createRadialGradient(0, 0, 0, 0, 0, rx);
    g2.addColorStop(0,   'rgba('+r+','+g+','+b+','+a+')');
    g2.addColorStop(0.5, 'rgba('+r+','+g+','+b+','+(a*0.35)+')');
    g2.addColorStop(1,   'rgba('+r+','+g+','+b+',0)');
    nc.fillStyle = g2;
    nc.beginPath();
    nc.arc(0, 0, rx, 0, Math.PI * 2);
    nc.fill();
    nc.restore();
  }

  /* ── Stars: static, just twinkle in-place ── */
  function buildStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      var roll = Math.random();
      stars.push({
        x:     rand(0, W),
        y:     rand(0, H),
        r:     rand(0.18, 1.5),
        base:  rand(0.08, 0.75),
        spd:   rand(0.3, 2.0),
        phase: rand(0, Math.PI * 2),
        col:   roll < 0.14 ? 'rgba(200,168,75,'
             : roll < 0.27 ? 'rgba(175,210,255,'
             :                'rgba(230,238,255,'
      });
    }
  }

  /* ── Drifting particles for constellation ── */
  function buildParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  rand(0, W),
        y:  rand(0, H),
        vx: rand(-0.28, 0.28),
        vy: rand(-0.28, 0.28),
        r:  rand(0.5, 1.5),
        col: Math.random() < 0.38
          ? 'rgba(200,168,75,'
          : 'rgba(210,225,248,'
      });
    }
  }

  /* ── Orbital rings (Interstellar Gargantua) ── */
  function buildRings() {
    rings = [
      { rx: Math.min(W, H) * 0.30, ry: Math.min(W, H) * 0.09, angle: 0, spd:  0.00022, alpha: 0.12 },
      { rx: Math.min(W, H) * 0.42, ry: Math.min(W, H) * 0.12, angle: 1.2, spd: -0.00015, alpha: 0.07 },
      { rx: Math.min(W, H) * 0.55, ry: Math.min(W, H) * 0.15, angle: 2.5, spd:  0.00010, alpha: 0.045 }
    ];
  }

  /* ── Main draw loop ── */
  function draw(now) {
    requestAnimationFrame(draw);
    var delta = now - lastFrame;
    if (delta < FRAME_INTERVAL) return;
    lastFrame = now - (delta % FRAME_INTERVAL);
    t += delta * 0.001;

    ctx.clearRect(0, 0, W, H);

    // 1. Nebulae (single drawImage)
    if (nebulaBg) ctx.drawImage(nebulaBg, 0, 0);

    // 2. Orbital rings (centred on screen)
    var cx = W * 0.5, cy = H * 0.45;
    for (var ri = 0; ri < rings.length; ri++) {
      var ring = rings[ri];
      ring.angle += ring.spd * delta;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.angle);
      ctx.scale(1, ring.ry / ring.rx);
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.rx, ring.rx, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,' + ring.alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Stars twinkle
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = s.base + s.base * 0.55 * Math.sin(t * s.spd + s.phase);
      ctx.globalAlpha = Math.max(0.04, Math.min(0.95, alpha));
      ctx.fillStyle = s.col + '1)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 4. Update particles + mouse repel
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var mdx = p.x - mouse.x;
      var mdy = p.y - mouse.y;
      var md2 = mdx * mdx + mdy * mdy;
      if (md2 < MOUSE_RADIUS * MOUSE_RADIUS && md2 > 0.1) {
        var mf = (MOUSE_RADIUS - Math.sqrt(md2)) / MOUSE_RADIUS * 0.5;
        var md = Math.sqrt(md2);
        p.x += (mdx / md) * mf;
        p.y += (mdy / md) * mf;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = p.col + '1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }

    // 5. Constellation lines
    ctx.lineWidth = 0.5;
    var cd2 = CONNECT_DIST * CONNECT_DIST;
    for (var i = 0; i < particles.length - 1; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < cd2) {
          var a = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.20;
          ctx.globalAlpha = a;
          ctx.strokeStyle = 'rgba(200,168,75,1)';
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ── Mouse + resize ── */
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', function () {
    mouse.x = -9999; mouse.y = -9999;
  });
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  requestAnimationFrame(draw);


  /* ═══════════════════════════════════════
     COUNTDOWN TIMER
     Target: April 12, 2025, 10:00 AM IST
     UPDATE this date to the real event date
  ═══════════════════════════════════════ */
  // Set your event date here (IST = UTC+5:30)
  var EVENT_DATE = new Date('2025-04-12T10:00:00+05:30');

  var cdDays  = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMins  = document.getElementById('cd-mins');
  var cdSecs  = document.getElementById('cd-secs');
  var cdWrap  = document.getElementById('countdown-wrap');
  var cdLive  = document.getElementById('cd-live');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tickCountdown() {
    var now  = Date.now();
    var diff = EVENT_DATE.getTime() - now;

    if (diff <= 0) {
      cdDays.textContent = cdHours.textContent = cdMins.textContent = cdSecs.textContent = '00';
      if (cdWrap) cdWrap.style.display = 'none';
      if (cdLive) cdLive.style.display = 'block';
      clearInterval(cdTimer);
      return;
    }
    cdDays.textContent  = pad(Math.floor(diff / 86400000));
    cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    cdMins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
    cdSecs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
  }
  tickCountdown();
  var cdTimer = setInterval(tickCountdown, 1000);


  /* ═══════════════════════════════════════
     3D CARD TILT (hero card, desktop only)
  ═══════════════════════════════════════ */
  if (window.matchMedia('(min-width: 768px)').matches) {
    var card = document.getElementById('hero-card');
    if (card) {
      var tlx = 0, tly = 0, clx = 0, cly = 0, tlRAF = null;

      document.addEventListener('mousemove', function (e) {
        tlx = ((e.clientX / window.innerWidth)  - 0.5) * 14;
        tly = ((0.5 - e.clientY / window.innerHeight)) * 11;
        if (!tlRAF) tlRAF = requestAnimationFrame(lerpTilt);
      });
      document.addEventListener('mouseleave', function () { tlx = 0; tly = 0; });

      function lerpTilt() {
        clx += (tlx - clx) * 0.07;
        cly += (tly - cly) * 0.07;
        card.style.transform = 'perspective(1200px) rotateX('+cly+'deg) rotateY('+clx+'deg)';
        if (Math.abs(tlx - clx) > 0.05 || Math.abs(tly - cly) > 0.05) {
          tlRAF = requestAnimationFrame(lerpTilt);
        } else {
          tlRAF = null;
        }
      }
    }
  }


  /* ═══════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }


  /* ═══════════════════════════════════════
     NAV SCROLL BEHAVIOUR
  ═══════════════════════════════════════ */
  var nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ═══════════════════════════════════════
     MOBILE NAV TOGGLE
  ═══════════════════════════════════════ */
  var navToggler  = document.getElementById('nav-toggler');
  var navLinks    = document.getElementById('nav-links');
  if (navToggler && navLinks) {
    navToggler.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggler.classList.toggle('active');
    });
  }

}());
