/* ============================================================
   (NAME) CONSTRUCTION — MAIN JS — v2 Polished
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAnnounceBar();
  initNav();
  initMobileMenu();
  initHeroImages();
  initScrollAnimations();
  initCounters();
  initBeforeAfterSliders();
  initCarousel();
  initGalleryFilters();
  initFAQ();
  initBackToTop();
  initFormHandlers();
  initLazyImages();
  setActiveNav();
});

/* ── ANNOUNCEMENT BAR ─────────────────────────────────────── */
function initAnnounceBar() {
  const bar = document.querySelector('.announce-bar');
  if (!bar) return;

  const closed = sessionStorage.getItem('announce-closed');
  if (closed) { bar.remove(); return; }

  document.documentElement.classList.add('has-announce');

  const closeBtn = bar.querySelector('.announce-close');
  closeBtn?.addEventListener('click', () => {
    bar.style.transform = 'translateY(-100%)';
    bar.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      bar.remove();
      document.documentElement.classList.remove('has-announce');
      // Recalculate nav top
      const nav = document.getElementById('mainNav');
      if (nav) nav.style.top = '0';
    }, 300);
    sessionStorage.setItem('announce-closed', '1');
  });
}

/* ── NAV SCROLL BEHAVIOR ──────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const isHero = nav.classList.contains('transparent');

  const update = () => {
    if (isHero) {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── MOBILE MENU ──────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  const open = () => {
    toggle.classList.add('open');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    toggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? close() : open();
  });

  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.classList.contains('open')) close();
  });
}

/* ── HERO IMAGE LOAD ──────────────────────────────────────── */
function initHeroImages() {
  document.querySelectorAll('.hero-bg img').forEach(img => {
    const apply = () => img.classList.add('loaded');
    img.complete ? apply() : img.addEventListener('load', apply);
  });
}

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up, .fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── COUNTER ANIMATION ────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ── BEFORE/AFTER SLIDER ──────────────────────────────────── */
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const beforeEl = slider.querySelector('.ba-before');
    const handle   = slider.querySelector('.ba-handle');
    if (!beforeEl || !handle) return;

    let dragging = false;
    let rafId = null;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const setPosition = (clientX) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = slider.getBoundingClientRect();
        const pct  = clamp(((clientX - rect.left) / rect.width) * 100, 2, 98);
        beforeEl.style.clipPath = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;
        handle.style.left       = `${pct.toFixed(2)}%`;
      });
    };

    // Mouse
    const startDrag = (e) => { dragging = true; setPosition(e.clientX); };
    const moveDrag  = (e) => { if (dragging) setPosition(e.clientX); };
    const stopDrag  = ()  => { dragging = false; };

    slider.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', stopDrag);

    // Touch
    const touchStart = (e) => { dragging = true; e.preventDefault(); setPosition(e.touches[0].clientX); };
    const touchMove  = (e) => { if (dragging) setPosition(e.touches[0].clientX); };
    const touchEnd   = ()  => { dragging = false; };

    slider.addEventListener('touchstart', touchStart, { passive: false });
    document.addEventListener('touchmove',  touchMove,  { passive: true });
    document.addEventListener('touchend',   touchEnd);

    // Keyboard: focus handle and use arrow keys
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Compare before and after');
    handle.addEventListener('keydown', (e) => {
      const rect  = slider.getBoundingClientRect();
      const curPct = parseFloat(handle.style.left) || 50;
      let newPct   = curPct;
      if (e.key === 'ArrowLeft')  newPct -= 5;
      if (e.key === 'ArrowRight') newPct += 5;
      if (newPct !== curPct) {
        e.preventDefault();
        const clientX = rect.left + (newPct / 100) * rect.width;
        setPosition(clientX);
      }
    });
  });
}

/* ── TESTIMONIAL CAROUSEL ─────────────────────────────────── */
function initCarousel() {
  const carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  const track  = carousel.querySelector('.testimonials-track');
  const cards  = Array.from(track.querySelectorAll('.testimonial-card'));
  const dots   = Array.from(carousel.querySelectorAll('.carousel-dot'));
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  if (!cards.length) return;

  let current = 0;
  let autoTimer;

  const goTo = (index) => {
    current = ((index % cards.length) + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current);
    });
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAuto = () => { autoTimer = setInterval(next, 5500); };
  const stopAuto  = () => clearInterval(autoTimer);

  nextBtn?.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); }));

  // Keyboard
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
  });

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) { diff > 0 ? next() : prev(); stopAuto(); startAuto(); }
  }, { passive: true });

  goTo(0);
  startAuto();
}

/* ── GALLERY FILTERS ──────────────────────────────────────── */
function initGalleryFilters() {
  const container = document.querySelector('.gallery-grid');
  const filters   = document.querySelectorAll('.filter-btn');
  if (!container || !filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      container.querySelectorAll('.gallery-item').forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.style.opacity        = match ? '1' : '0.18';
        item.style.pointerEvents  = match ? '' : 'none';
        item.style.transform      = match ? '' : 'scale(0.97)';
      });
    });
  });
}

/* ── FAQ ACCORDION ────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = btn.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-q.open').forEach(b => {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq-item').querySelector('.faq-a').style.maxHeight = '0';
      });

      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
      }
    });
  });
}

/* ── BACK TO TOP ──────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── FORM HANDLERS ────────────────────────────────────────── */
function initFormHandlers() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const btn = form.querySelector('[type="submit"]');
      if (!btn) return;

      const original    = btn.innerHTML;
      const originalBg  = btn.style.background;
      btn.innerHTML     = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="18" height="18" style="animation:spin 0.8s linear infinite"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sending...';
      btn.disabled      = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data._subject = 'New Estimate Request — T Square Remodeling';
      data._captcha = 'false';

      fetch('https://formsubmit.co/ajax/Brent@tsquareremodel.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(() => {
        btn.innerHTML        = '✓ Message Received — We\'ll Be In Touch Soon!';
        btn.style.background = 'var(--success)';
        btn.style.boxShadow  = '0 8px 24px rgba(22,163,74,0.35)';
        setTimeout(() => {
          btn.innerHTML        = original;
          btn.disabled         = false;
          btn.style.background = originalBg;
          btn.style.boxShadow  = '';
          form.reset();
        }, 4500);
      })
      .catch(() => {
        btn.innerHTML = 'Something went wrong — please try again.';
        btn.disabled  = false;
        setTimeout(() => { btn.innerHTML = original; }, 3000);
      });
    });
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const wrap = field.closest('.form-group');
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = 'var(--error)';
      if (wrap && !wrap.querySelector('.field-err')) {
        const err = document.createElement('span');
        err.className    = 'field-err';
        err.textContent  = 'This field is required';
        err.style.cssText = 'display:block;font-size:0.75rem;color:var(--error);margin-top:4px;';
        wrap.appendChild(err);
      }
    } else {
      field.style.borderColor = '';
      wrap?.querySelector('.field-err')?.remove();
    }
  });
  if (!valid) {
    form.querySelector('[required]')?.focus();
  }
  return valid;
}

/* ── LAZY IMAGE LOADING ───────────────────────────────────── */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy supported

  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => observer.observe(img));
}

/* ── ACTIVE NAV LINK ──────────────────────────────────────── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── SPIN KEYFRAME ────────────────────────────────────────── */
const _s = document.createElement('style');
_s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_s);
