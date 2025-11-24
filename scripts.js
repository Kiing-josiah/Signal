(() => {
  const doc = document;
  const $  = (sel, ctx=doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx=doc) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------
     0) Small quality-of-life + nav toggle
  -------------------------------------- */
  // Update © year
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scrollspy links should carry .link class for underline style
  $$('.nav__link').forEach(a => a.classList.add('link'));

  // Mobile nav toggle (progressive enhancement)
  (function navToggle(){
    const btn = $('.nav__toggle');
    const list = $('#nav-list');
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('is-open', !open);
    });
  })();

  /* -------------------------------
     1) Parallax (non-cumulative)
  ------------------------------- */
  function setupParallax(){
    if (prefersReduced) return;

    const wrap = $('.hero__visuals');
    if (!wrap) return;

    const layers = [
      { el: $('.orbs--one', wrap), strength:  6 },
      { el: $('.orbs--two', wrap), strength:  8 },
      { el: $('.hero-calendar', wrap), strength: 12 }
    ].filter(l=>l.el);

    let raf = null;
    let x = 0, y = 0;

    function onMove(e){
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top  + r.height/2;
      x = clamp((e.clientX - cx) / (r.width/2), -1, 1);
      y = clamp((e.clientY - cy) / (r.height/2), -1, 1);
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function apply(){
      layers.forEach(({el,strength})=>{
        el.style.transform = `translate3d(${(x*strength).toFixed(2)}px, ${(y*strength).toFixed(2)}px, 0)`;
      });
      raf = null;
    }
    function reset(){
      layers.forEach(({el})=>{ el.style.transform = 'translate3d(0,0,0)'; });
    }

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', reset);
    addEventListener('blur', reset);
    addEventListener('resize', reset);
  }

  /* -------------------------------
     2) Ripple on press (buttons)
  ------------------------------- */
  function setupRipple(){
    // Inject minimal CSS for ripple (keeps stylesheet clean)
    const css = `
      .ripple{position:absolute;border-radius:50%;pointer-events:none;transform:scale(0);
        background: radial-gradient(circle, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 60%);
        opacity:.55; animation:ripple .45s ease-out forwards;}
      @keyframes ripple{to{transform:scale(1);opacity:0}}
    `;
    const style = doc.createElement('style');
    style.textContent = css;
    doc.head.appendChild(style);

    $$('.btn').forEach(btn=>{
      btn.style.overflow = 'hidden';
      btn.addEventListener('pointerdown', e=>{
        if (prefersReduced) return;
        const r = btn.getBoundingClientRect();
        const d = Math.max(r.width, r.height);
        const s = doc.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = d + 'px';
        s.style.left = (e.clientX - r.left - d/2) + 'px';
        s.style.top  = (e.clientY - r.top  - d/2) + 'px';
        btn.appendChild(s);
        setTimeout(()=>s.remove(), 480);
      });
    });
  }

  /* -------------------------------
     3) Reveal on scroll
  ------------------------------- */
  function setupReveal(){
    const targets = [
      ...$$('.section__header'),
      ...$$('.card'),
      ...$$('.demo__player'),
      ...$$('.calendar__embed'),
      ...$$('.form')
    ];
    if (!targets.length) return;

    // Inject minimal CSS just for reveal
    const css = `
      .reveal{opacity:0; transform:translate3d(0,18px,0); transition:opacity .28s ease, transform .28s ease;}
      .reveal.is-inview{opacity:1; transform:translate3d(0,0,0);}
    `;
    const style = doc.createElement('style');
    style.textContent = css;
    doc.head.appendChild(style);

    targets.forEach(el=>el.classList.add('reveal'));

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting){
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin:'0px 0px -10% 0px', threshold:0.15 });

    targets.forEach(el=>io.observe(el));
  }

  /* -------------------------------
     4) Scrollspy (active nav)
  ------------------------------- */
  function setupScrollspy(){
    const sections = ['home','services','pricing','faq','contact']
      .map(id => $('#'+id)).filter(Boolean);
    const links = $$('.nav__link');
    const map = new Map(links.map(a => [a.getAttribute('href').replace('#',''), a]));

    function setActive(id){
      links.forEach(a=>a.classList.remove('active'));
      const target = map.get(id);
      if (target) target.classList.add('active');
    }

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin:'-45% 0px -50% 0px', threshold:0.01 });

    sections.forEach(sec=>io.observe(sec));
  }

  /* -------------------------------------------
     5) Pricing radio tabs (hash persistence)
  ------------------------------------------- */
  function setupPricingTabs(){
    const monthly = $('#bill-monthly');
    const quarter = $('#bill-quarter');
    const yearly  = $('#bill-yearly');
    if (!monthly || !quarter || !yearly) return;

    // Apply initial state from hash (#bill=monthly|quarter|yearly)
    const paramsFromHash = ()=>{
      const m = location.hash.match(/bill=(monthly|quarter|yearly)/i);
      return (m && m[1].toLowerCase()) || 'monthly';
    };
    function apply(period){
      if (period === 'quarter') quarter.checked = true;
      else if (period === 'yearly') yearly.checked = true;
      else monthly.checked = true;
    }
    apply(paramsFromHash());

    // Update hash on change (no scroll jump)
    [monthly,quarter,yearly].forEach(r=>{
      r.addEventListener('change', ()=>{
        const period = r === quarter ? 'quarter' : r === yearly ? 'yearly' : 'monthly';
        const base = location.href.split('#')[0];
        history.replaceState(null,'', base + '#bill=' + period);
      });
    });
  }

  /* -------------------------------
     Init
  ------------------------------- */
  addEventListener('DOMContentLoaded', () => {
    setupParallax();
    setupRipple();
    setupReveal();
    setupScrollspy();
    setupPricingTabs();
  });
})();