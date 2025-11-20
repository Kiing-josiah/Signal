// GenDesk Landing Interactions
window.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  // Close menu when clicking a link (mobile)
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // GSAP animations
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.site-header', { y: -32, autoAlpha: 0, duration: 0.6, ease: 'power2.out' });

    gsap.from('.headline', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.subhead', { y: 16, autoAlpha: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    gsap.from('.cta-row', { y: 14, autoAlpha: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });

    // Parallax/floating orbs
    gsap.to('.orb-a', { x: 60, y: 30, duration: 18, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orb-b', { x: -60, y: -40, duration: 22, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orb-c', { x: 30, y: -20, duration: 20, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // Reveal sections
    gsap.utils.toArray('[data-animate="card"]').forEach((card, i) => {
      gsap.from(card, {
        y: 24, autoAlpha: 0, duration: 0.8, delay: i * 0.06,
        scrollTrigger: { trigger: card, start: 'top 85%' }, ease: 'power3.out'
      });
    });

    gsap.from('#about .about-copy', {
      y: 24, autoAlpha: 0, duration: 0.8,
      scrollTrigger: { trigger: '#about', start: 'top 80%' }, ease: 'power3.out'
    });
    gsap.from('#about .about-media', {
      y: 24, autoAlpha: 0, duration: 0.8, delay: 0.1,
      scrollTrigger: { trigger: '#about', start: 'top 80%' }, ease: 'power3.out'
    });

    gsap.from('[data-animate="glow"]', {
      scale: 0.98, autoAlpha: 0, duration: 0.8,
      scrollTrigger: { trigger: '[data-animate="glow"]', start: 'top 85%' }, ease: 'power3.out'
    });
  }

  // Counter Up on visibility
  const nums = document.querySelectorAll('.stat .num');
  const format = (n) => n >= 100 ? `${Math.floor(n)}+` : `${Math.floor(n)}`;
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = start + (target - start) * eased;
      el.textContent = format(value);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCount(entry.target.querySelector('.num'));
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat').forEach(s => io.observe(s));

  // Tilt effect for cards
  document.querySelectorAll('.card').forEach(card => {
    let bounds;
    const rotate = (x, y) => {
      const cx = x - bounds.left, cy = y - bounds.top;
      const rx = ((cy - bounds.height/2) / bounds.height) * -8;
      const ry = ((cx - bounds.width/2) / bounds.width) * 8;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    };
    card.addEventListener('mouseenter', () => bounds = card.getBoundingClientRect());
    card.addEventListener('mousemove', (e) => rotate(e.clientX, e.clientY));
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
});
