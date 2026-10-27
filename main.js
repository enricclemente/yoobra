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
  document.querySelectorAll('.faq-cat__items').forEach((group) => {
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
