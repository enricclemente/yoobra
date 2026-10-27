// yoobra homepage – motion layer (no dependencies)
(function () {
  const root = document.documentElement;
  if (!root.classList.contains('motion')) return;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------
     1. Split headings into words for line-by-line reveals
     ------------------------------------------------------------------ */
  const splitTargets = [
    '.hero__title', '.h-display', '.theatre__title', '.system__title',
    '.manifesto__title', '.founder__quote', '.faq__title', '.footer__big',
    '.newsletter__title', '.proof__title', '.recog-card__title'
  ];
  function split(el) {
    if (el.dataset.split !== undefined) return;
    el.setAttribute('data-split', '');
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'split-w';
          w.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.className = 'split-i';
          inner.style.setProperty('--i', i++);
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
      } else {
        frag.appendChild(node.cloneNode(true));
      }
    });
    el.textContent = '';
    el.appendChild(frag);
  }
  $$(splitTargets.join(',')).forEach(split);

  /* ------------------------------------------------------------------
     2. Tag elements for reveal, with stagger inside groups
     ------------------------------------------------------------------ */
  const tag = (sel, type = '', d) => $$(sel).forEach((el) => {
    if (el.hasAttribute('data-split')) return;
    el.setAttribute('data-reveal', type);
    if (d) el.style.setProperty('--d', d + 'ms');
  });
  const stagger = (groupSel, itemSel, type = '') => $$(groupSel).forEach((g) => {
    $$(itemSel, g).forEach((el, i) => { el.setAttribute('data-reveal', type); el.style.setProperty('--i', i); });
  });

  tag('.eyebrow, .insta__handle', 'fade');
  tag('.proof__body, .edu__body, .fit__body, .theatre__body, .recog__body p, .founder__body, .manifesto__body, .care__sub, .system__sub, .faq__body, .newsletter__privacy, .insta__sub, .footer__tag, .footer__promise, .footer__contact', '', 150);
  tag('.looks__cta, .fit__actions, .theatre__statement .btn, .recog__body .btn, .founder__copy > .btn, .insta__head > .btn, .system__actions, .newsletter__form, .compare-card .btn', '', 250);
  tag('.quiz', 'right', 150);
  tag('.edu__stat', 'scale');
  tag('.manifesto__band', 'scale', 100);
  tag('.footer__brand > img', 'fade');
  stagger('.looks__grid', '.look-card');
  stagger('.compare__grid', '.compare-card');
  stagger('.recog__cards', '.recog-card');
  stagger('.insta__grid', '.insta-post', 'scale');
  stagger('.care__grid', '.care-card');
  stagger('.system__steps', '.step', 'left');
  stagger('.faq-cat__items', '.acc');
  stagger('.footer__links', '.footer__col');
  stagger('.footer__payments', 'li', 'fade');
  stagger('.fit-bar--founder', '.fit-bar__icon', 'scale');

  // Clip reveals on key photography
  [['.founder__image', ''], ['.edu__media', 'left'], ['.system__media', 'left']].forEach(([s, t]) => {
    const el = $(s); if (el) el.setAttribute('data-clip', t);
  });

  // Delay annotations so they draw after the image arrives
  $$('.anno').forEach((a, i) => a.style.setProperty('--d', (500 + (i % 2) * 250) + 'ms'));

  /* ------------------------------------------------------------------
     3. Intersection observer → .is-in
     ------------------------------------------------------------------ */
  const watch = $$('[data-split], [data-reveal], [data-clip], .proof, .media-card, .look-card, .manifesto__band, .quiz, .motif');
  // Some targets can't be observed directly: clipped elements report no visible
  // area, and cards inside horizontal swipe tracks sit off-screen sideways.
  // Those are revealed through a proxy (their parent / their track).
  const proxyOf = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (proxyOf.get(e.target) || [e.target]).forEach((el) => el.classList.add('is-in'));
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  const addProxy = (proxy, el) => {
    if (!proxyOf.has(proxy)) { proxyOf.set(proxy, [proxy]); io.observe(proxy); }
    proxyOf.get(proxy).push(el);
  };
  watch.forEach((el) => {
    if (el.closest('.hero')) return;
    const track = el.closest('.swipe');
    if (track && el !== track) return addProxy(track, el);
    if (el.hasAttribute('data-clip') || el.classList.contains('motif')) return addProxy(el.parentElement, el);
    io.observe(el);
  });

  /* ------------------------------------------------------------------
     4. Hero intro
     ------------------------------------------------------------------ */
  const hero = $('.hero');
  if (hero) {
    const tiles = document.createElement('div');
    tiles.className = 'hero__tiles';
    const order = [4, 1, 3, 5, 7, 0, 2, 6, 8];
    tiles.innerHTML = order.map((n) => `<i style="--i:${n}"></i>`).join('');
    hero.insertBefore(tiles, $('.hero__overlay', hero));
    const cue = document.createElement('span');
    cue.className = 'scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    hero.appendChild(cue);
    $$('.hero__actions > *', hero).forEach((b, i) => b.style.setProperty('--i', i));
    $$('.hero__title .split-i').forEach((w) => w.style.setProperty('--d', '250ms'));

    const go = () => requestAnimationFrame(() => {
      hero.classList.add('is-in');
      $('.hero__title').classList.add('is-in');
      setTimeout(() => hero.classList.add('is-ready'), 2500);
      // Animate the fit-invite step dots
      const steps = $$('.fit-invite__steps i');
      let s = 0;
      setInterval(() => {
        steps.forEach((st, i) => st.classList.toggle('is-active', i === s));
        steps.forEach((st, i) => { st.style.width = i === s ? '12px' : ''; });
        s = (s + 1) % steps.length;
      }, 900);
    });
    const img = $('.hero__media', hero);
    if (img.complete) go(); else { img.addEventListener('load', go); setTimeout(go, 1200); }
  }

  /* ------------------------------------------------------------------
     6. Count-up for the 94% stat
     ------------------------------------------------------------------ */
  const stat = $('.edu__stat');
  if (stat) {
    const target = parseInt(stat.textContent, 10) || 0;
    stat.setAttribute('aria-label', stat.textContent);
    stat.textContent = '0%';
    const sio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      sio.disconnect();
      const t0 = performance.now(), dur = 1800;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        stat.textContent = Math.round(target * eased) + '%';
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    sio.observe(stat);
  }

  /* ------------------------------------------------------------------
     7. Scroll-linked effects (one rAF loop)
     ------------------------------------------------------------------ */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const nav = $('.nav');
  const heroMedia = $('.hero__media');
  const heroStatement = $('.hero__statement');
  const theatre = $('.theatre');
  const theatreMedia = $('.theatre__media');
  const parallax = $$('.edu__media .slides, .manifesto__band > .slides, .look-card__media .slides, .founder__image img, .system__media .media-card__img');
  parallax.forEach((el) => el.setAttribute('data-parallax', ''));

  let lastY = window.scrollY;

  function frame(now) {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    progress.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;

    // Nav
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);
      const menuOpen = $('.nav__menu-btn')?.getAttribute('aria-expanded') === 'true';
      if (!menuOpen && y > 600 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 600) nav.classList.remove('is-hidden');
    }

    // Hero parallax + fade
    if (heroMedia && y < vh * 1.4) {
      heroMedia.style.setProperty('--py', (y * 0.35).toFixed(1) + 'px');
      if (hero.classList.contains('is-ready')) heroMedia.style.transform = `scale(1.04) translate3d(0, ${(y * 0.35).toFixed(1)}px, 0)`;
      const p = Math.min(1, y / (vh * 0.8));
      heroStatement.style.transform = `translate3d(0, ${(y * -0.18).toFixed(1)}px, 0)`;
      heroStatement.style.opacity = (1 - p * 1.1).toFixed(3);
    }

    // Image parallax
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const center = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      el.style.setProperty('--py', (center * -40).toFixed(1) + 'px');
    });

    // Theatre: framed window opens to full bleed
    if (theatre) {
      const r = theatre.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.7)));
        const e = 1 - Math.pow(1 - p, 3);
        const ix = isDesktop() ? 120 : 16;
        theatre.style.setProperty('--inset-x', ((1 - e) * ix).toFixed(1) + 'px');
        theatre.style.setProperty('--inset-y', ((1 - e) * (isDesktop() ? 60 : 14)).toFixed(1) + 'px');
        theatre.style.setProperty('--inset-r', ((1 - e) * 24).toFixed(1) + 'px');
        theatreMedia.style.setProperty('--ts', (1.25 - e * 0.25).toFixed(4));
        theatreMedia.style.transform = `scale(${(1.25 - e * 0.25).toFixed(4)}) translate3d(0, ${((r.top / vh) * 40).toFixed(1)}px, 0)`;
      }
    }

    lastY = y;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ------------------------------------------------------------------
     8. Pointer effects: magnetic buttons + 3D tilt cards (desktop only)
     ------------------------------------------------------------------ */
  if (finePointer) {
    $$('.btn, .glass-btn, .fit-invite__arrow, .fit-bar__arrow').forEach((el) => {
      el.setAttribute('data-magnetic', '');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    $$('.look-card, .care-card, .quiz').forEach((el) => {
      el.setAttribute('data-tilt', '');
      el.addEventListener('mousemove', (e) => {
        if (!el.classList.contains('is-in') && el.hasAttribute('data-reveal')) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (y * -8).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------
     9. Smooth FAQ open/close
     ------------------------------------------------------------------ */
  $$('.acc').forEach((d) => {
    const p = $('p', d);
    if (!p) return;
    const body = document.createElement('div');
    body.className = 'acc__body';
    p.replaceWith(body);
    body.appendChild(p);
    const summary = $('summary', d);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(() => { body.style.height = '0px'; body.style.opacity = '0'; });
        body.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'height') return;
          d.open = false; body.style.height = ''; body.style.opacity = '';
          body.removeEventListener('transitionend', done);
        });
      } else {
        // close siblings in the same group
        $$('details[open]', d.parentElement).forEach((o) => { if (o !== d) $('summary', o).click(); });
        d.open = true;
        body.style.height = '0px'; body.style.opacity = '0';
        requestAnimationFrame(() => { body.style.height = body.scrollHeight + 'px'; body.style.opacity = '1'; });
        body.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'height') return;
          body.style.height = '';
          body.removeEventListener('transitionend', done);
        });
      }
    });
  });
})();
