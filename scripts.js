(() => {
  const doc = document;
  const $  = (sel, ctx=doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx=doc) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------
     0) Small quality-of-life
  ------------------------- */
  // Update © year in footer
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Ensure nav links get the underline style (re-use .link CSS rule)
  $$('.nav__link').forEach(a => a.classList.add('link'));

  /* -------------------------
     1) Parallax (non-cumulative)
  ------------------------- */
  function setupParallax() {
    if (prefersReduced) return;

    const wrap = $('.hero__visuals');
    if (!wrap) return;

    const layers = [
      { el: $('.orbs--one', wrap),  strength:  6 },
      { el: $('.orbs--two', wrap),  strength:  8 },
      { el: $('.hero-calendar', wrap), strength: 10 },
      { el: $('.hero-portrait', wrap), strength: 14 }
    ].filter(l => l.el);

    let raf = null;
    let x = 0, y = 0;

    function onMove(e) {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      x = clamp((e.clientX - cx) / (r.width / 2), -1, 1);
      y = clamp((e.clientY - cy) / (r.height / 2), -1, 1);

      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    }

    function tick() {
      layers.forEach(({ el, strength }) => {
        // translate3d only; we replace transform each frame (no accumulation)
        el.style.transform = `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px, 0)`;
      });
      raf = null;
    }

    function reset() {
      layers.forEach(({ el }) => { el.style.transform = 'translate3d(0,0,0)'; });
    }

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', reset);
  }

  /* -------------------------
     2) Ripple on press (buttons)
  ------------------------- */
  function setupRipple() {
    // Inject minimal styles for ripple so we don't edit CSS file
    const css = `
      .ripple {
        position:absolute; border-radius:50%; pointer-events:none; transform:scale(0);
        background: radial-gradient(circle, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 60%);
        opacity:.55; animation:ripple .45s ease-out forwards;
      }
      @keyframes ripple {
        to { transform:scale(1); opacity:0; }
      }`;
    const style = doc.createElement('style');
    style.textContent = css;
    doc.head.appendChild(style);

    $$('.btn').forEach(btn => {
      btn.style.overflow = 'hidden'; // keep ripple inside
      btn.addEventListener('pointerdown', e => {
        if (prefersReduced) return;
        const r = btn.getBoundingClientRect();
        const d = Math.max(r.width, r.height);
        const s = doc.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = d + 'px';
        s.style.left = (e.clientX - r.left - d / 2) + 'px';
        s.style.top  = (e.clientY - r.top  - d / 2) + 'px';
        btn.appendChild(s);
        setTimeout(() => s.remove(), 480);
      });
    });
  }

  /* -------------------------
     3) Reveal on scroll
  ------------------------- */
  function setupReveal() {
    // Add reveal class to key elements
    const targets = [
      ...$$('.section__header'),
      ...$$('.card'),
      ...$$('.about__image'),
      ...$$('.stat'),
      ...$$('.demo__player'),
      ...$$('.calendar__embed'),
      ...$$('.form')
    ];

    // Inject minimal CSS for reveal without touching main stylesheet
    const css = `
      .reveal { opacity:0; transform:translate3d(0,18px,0); transition:opacity .28s ease, transform .28s ease; }
      .reveal.is-inview { opacity:1; transform:translate3d(0,0,0); }
    `;
    const style = doc.createElement('style');
    style.textContent = css;
    doc.head.appendChild(style);

    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          // Only animate once
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    targets.forEach(el => io.observe(el));
  }

  /* -------------------------
     4) Scrollspy (active nav underline)
  ------------------------- */
  function setupScrollspy() {
    const sections = ['home','services','about','demo','calendar','contact']
      .map(id => $('#' + id))
      .filter(Boolean);

    const links = $$('.nav__link');
    const linkById = new Map(
      links.map(a => [a.getAttribute('href').replace('#',''), a])
    );

    // Helper to set active class
    function setActive(id) {
      links.forEach(a => a.classList.remove('active', 'link-active'));
      const target = linkById.get(id);
      if (target) target.classList.add('active'); // CSS uses .link.active::after via earlier addClass
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) setActive(id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

    sections.forEach(sec => io.observe(sec));
  }

  /* -------------------------
     5) Mobile nav toggle (a11y)
  ------------------------- */
  function setupNavToggle() {
    const btn = $('.nav__toggle');
    const list = $('#nav-list');
    if (!btn || !list) return;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('is-open', !open);
    });
  }

  /* -------------------------
     Init
  ------------------------- */
  window.addEventListener('DOMContentLoaded', () => {
    setupParallax();
    setupRipple();
    setupReveal();
    setupScrollspy();
    setupNavToggle();
  });
  function setupMagneticButtons(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const btns = document.querySelectorAll('.btn--magnetic');
  const strength = 10; // px max translate

  btns.forEach(btn => {
    const inner = btn.querySelector('.btn__inner') || btn;
    let raf = null, tx = 0, ty = 0;

    function move(e){
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const y = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
      tx = Math.max(-1, Math.min(1, x)) * strength;
      ty = Math.max(-1, Math.min(1, y)) * strength;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick(){
      inner.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      raf = null;
    }
    function reset(){
      inner.style.transform = 'translate3d(0,0,0)';
    }

    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', reset);
    btn.addEventListener('blur', reset);
  });
}

/* =========================
   7) 3D tilt on service cards
========================= */
function setupTiltCards(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const cards = document.querySelectorAll('.service');
  const maxDeg = 7;   // max tilt
  const maxTrans = 6; // px lift

  cards.forEach(card => {
    let raf = null, rx = 0, ry = 0, tz = 0;

    function move(e){
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
      const py = ((e.clientY - r.top)  / r.height) * 2 - 1;
      ry = -(px * maxDeg); // rotateY
      rx =  (py * maxDeg); // rotateX
      tz = maxTrans;
      if (!raf) { card.classList.add('is-tilting'); raf = requestAnimationFrame(apply); }
    }
    function apply(){
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(${tz}px)`;
      raf = null;
    }
    function reset(){
      card.classList.remove('is-tilting');
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    }

    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', reset);
    window.addEventListener('blur', reset);
  });
}

/* Call these in your DOMContentLoaded init */
window.addEventListener('DOMContentLoaded', () => {
  setupMagneticButtons();
  setupTiltCards();
});
})();
