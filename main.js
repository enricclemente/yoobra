// yoobra homepage – small progressive enhancements
(function () {
  // Mobile menu
  const menuBtn = document.querySelector('.nav__menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      menuBtn.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.hidden = open;
    });
  }

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
    const DUR = 5000 + (n % 3) * 600; // offset so cards don't change in lockstep
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
