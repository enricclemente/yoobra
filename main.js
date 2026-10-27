// yoobra homepage – small progressive enhancements
(function () {
  // Hero video controls (pause/play, mute/unmute) – wire to a <video> when one is added
  document.querySelectorAll('.hero [data-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
      const video = document.querySelector('.hero video');
      if (btn.dataset.toggle === 'pause') {
        btn.setAttribute('aria-label', pressed ? 'Pause video' : 'Play video');
        if (video) pressed ? video.play() : video.pause();
      } else {
        btn.setAttribute('aria-label', pressed ? 'Unmute video' : 'Mute video');
        if (video) video.muted = pressed;
      }
    });
  });

  // Swipe carousels: dot indicators that follow scroll position (mobile)
  document.querySelectorAll('[data-carousel]').forEach((track) => {
    const dots = track.nextElementSibling;
    if (!dots || !dots.classList.contains('dots')) return;
    const items = Array.from(track.children);
    dots.innerHTML = items.map((_, i) => `<i${i === 0 ? ' class="is-active"' : ''}></i>`).join('');
    const marks = Array.from(dots.children);
    const update = () => {
      const left = track.scrollLeft;
      let idx = 0;
      items.forEach((el, i) => { if (el.offsetLeft - track.offsetLeft <= left + 10) idx = i; });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) idx = items.length - 1;
      marks.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    };
    track.addEventListener('scroll', update, { passive: true });
  });

  // FAQ: one open item per category
  if (!document.documentElement.classList.contains('motion')) document.querySelectorAll('.faq-cat__items').forEach((group) => {
    group.querySelectorAll('details').forEach((d) => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        group.querySelectorAll('details[open]').forEach((o) => { if (o !== d) o.open = false; });
      });
    });
  });

  // Newsletter: inline success state, no page change
  const form = document.querySelector('.newsletter__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.querySelector('.newsletter__msg');
      if (!input.checkValidity() || !input.value) {
        msg.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      // TODO: connect to your email platform (e.g. Klaviyo) here.
      msg.textContent = 'Thank you – you’re on the list.';
      form.reset();
    });
  }
})();

// Image carousels: fade between slides, dots + arrows + swipe + autoplay in view
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slider]').forEach((root, n) => {
    const slides = Array.from(root.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    const DUR = 6500 + (n % 3) * 700; // offset so cards don't change in lockstep
    root.style.setProperty('--dur', DUR + 'ms');
    let idx = 0, timer = null, inView = false, hover = false;

    // Rebuild the pager dots as real buttons
    const pager = root.querySelector('.pager');
    let dots = [];
    if (pager) {
      pager.removeAttribute('aria-hidden');
      pager.setAttribute('role', 'tablist');
      pager.innerHTML = slides.map((_, i) =>
        `<button type="button" role="tab" aria-label="Show image ${i + 1} of ${slides.length}"${i === 0 ? ' class="is-active" aria-selected="true"' : ' aria-selected="false"'}></button>`).join('');
      dots = Array.from(pager.children);
      dots.forEach((d, i) => d.addEventListener('click', () => go(i, true)));
    }

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === idx);
        d.setAttribute('aria-selected', String(k === idx));
        // restart the timer animation
        if (k === idx) { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; }
      });
      root.setAttribute('data-slide', String(idx));
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      if (reduce || !inView || hover) return;
      timer = setInterval(() => go(idx + 1), DUR);
    }

    const [prev, next] = root.querySelectorAll('.arrow-btn');
    prev && prev.addEventListener('click', () => go(idx - 1, true));
    next && next.addEventListener('click', () => go(idx + 1, true));

    // Swipe
    let x0 = null;
    const inSwipeTrack = () => root.closest('.swipe') && window.innerWidth <= 900;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null || inSwipeTrack()) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });

    root.addEventListener('mouseenter', () => { hover = true; root.classList.add('is-paused'); clearInterval(timer); });
    root.addEventListener('mouseleave', () => { hover = false; root.classList.remove('is-paused'); go(idx, true); });

    new IntersectionObserver(([e]) => { inView = e.isIntersecting; restart(); }, { threshold: 0.4 }).observe(root);
    root.setAttribute('data-slide', '0');
  });
})();

// Sticky CTA bar: shows as soon as you scroll, hides near the footer and while the
// Fit Finder section (which already offers the same action) is on screen
(function () {
  const bar = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;
  const footer = document.querySelector('.footer');
  const fit = document.querySelector('.fit');
  const links = bar.querySelectorAll('a');
  let pastHero = false, footerIn = false, fitIn = false;

  const update = () => {
    const show = pastHero && !footerIn && !fitIn;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    links.forEach((a) => a.tabIndex = show ? 0 : -1);
    document.body.classList.toggle('has-sticky-cta', show);
  };

  const onScroll = () => {
    const next = window.scrollY > 120;
    if (next !== pastHero) { pastHero = next; update(); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (footer) new IntersectionObserver(([e]) => { footerIn = e.isIntersecting; update(); }).observe(footer);
  if (fit) new IntersectionObserver(([e]) => { fitIn = e.isIntersecting; update(); }, { threshold: 0.35 }).observe(fit);
})();

// Navigation: desktop mega panels, search state, mobile drawer
(function () {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const mega = nav.querySelector('.mega');
  const scrim = document.querySelector('.nav-scrim');
  const triggers = Array.from(nav.querySelectorAll('.nav__trigger'));
  const panels = Array.from(nav.querySelectorAll('.mega__panel'));
  const searchOpeners = Array.from(nav.querySelectorAll('[data-search-open]'));
  const searchInput = document.getElementById('nav-search-input');
  const menuBtn = nav.querySelector('.nav__menu-btn');
  const drawer = document.getElementById('mobile-menu');
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
  let current = null, closeTimer = null, openTimer = null;

  const setDrawerTop = () => nav.style.setProperty('--drawer-top', nav.querySelector('.nav__bar').getBoundingClientRect().bottom + 'px');

  function show(id) {
    clearTimeout(closeTimer);
    if (current === id) return;
    const switching = current !== null;
    mega.classList.toggle('is-switching', switching);
    panels.forEach((p) => p.classList.toggle('is-open', p.id === id));
    triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.panel === id)));
    searchOpeners.forEach((b) => b.setAttribute('aria-expanded', String(id === 'mega-search')));
    mega.setAttribute('aria-hidden', 'false');
    nav.classList.add('is-open');
    nav.classList.toggle('is-searching', id === 'mega-search');
    scrim.classList.add('is-visible');
    current = id;
  }
  function hide() {
    clearTimeout(openTimer);
    panels.forEach((p) => p.classList.remove('is-open'));
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    searchOpeners.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    mega.setAttribute('aria-hidden', 'true');
    mega.classList.remove('is-switching');
    nav.classList.remove('is-open', 'is-searching');
    if (!nav.classList.contains('is-drawer')) scrim.classList.remove('is-visible');
    document.body.classList.toggle('nav-locked', nav.classList.contains('is-drawer'));
    current = null;
  }
  const scheduleHide = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => { if (current !== 'mega-search') hide(); }, 280); };

  // Desktop: hover intent + click/keyboard
  triggers.forEach((t) => {
    t.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      clearTimeout(openTimer);
      openTimer = setTimeout(() => show(t.dataset.panel), current ? 60 : 140);
    });
    t.addEventListener('mouseleave', () => clearTimeout(openTimer));
    t.addEventListener('click', () => (current === t.dataset.panel ? hide() : show(t.dataset.panel)));
  });
  nav.addEventListener('mouseleave', () => { if (!isMobile()) scheduleHide(); });
  nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  scrim.addEventListener('click', () => { hide(); closeDrawer(); });

  // Search
  searchOpeners.forEach((b) => b.addEventListener('click', () => {
    if (current === 'mega-search') return hide();
    closeDrawer(true);
    setDrawerTop();
    show('mega-search');
    if (isMobile()) document.body.classList.add('nav-locked');
    setTimeout(() => searchInput && searchInput.focus({ preventScroll: true }), 250);
  }));
  nav.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', () => { hide(); }));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const wasSearch = current === 'mega-search';
    const opener = current && triggers.find((t) => t.dataset.panel === current);
    hide(); closeDrawer();
    if (opener) opener.focus(); else if (wasSearch) searchOpeners[searchOpeners.length - 1].focus();
  });

  // Mobile drawer
  function openDrawer() {
    hide();
    setDrawerTop();
    drawer.hidden = false;
    requestAnimationFrame(() => {
      nav.classList.add('is-drawer');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('nav-locked');
    });
  }
  function closeDrawer(instant) {
    if (!nav.classList.contains('is-drawer')) return;
    nav.classList.remove('is-drawer');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-locked');
    scrim.classList.remove('is-visible');
    setTimeout(() => { if (!nav.classList.contains('is-drawer')) drawer.hidden = true; }, instant ? 0 : 800);
  }
  menuBtn.addEventListener('click', () => (nav.classList.contains('is-drawer') ? closeDrawer() : openDrawer()));
  drawer.querySelectorAll('.drawer__toggle').forEach((btn) => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    drawer.querySelectorAll('.drawer__toggle').forEach((o) => o.setAttribute('aria-expanded', 'false'));
    btn.setAttribute('aria-expanded', String(!open));
  }));

  window.addEventListener('resize', () => { if (!isMobile()) closeDrawer(true); setDrawerTop(); });
})();
