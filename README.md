# yoobra – Homepage

Built from the Figma frame "01 · Homepage · V2" (desktop 1440px + mobile 390px).

Open `index.html` in a browser. No build step.

- `index.html` – markup
- `styles.css` – all styles (design tokens at the top, mobile layout under `@media (max-width: 900px)`)
- `main.js` – mobile menu, image carousels, swipe-track dots, FAQ accordion, newsletter success message
- `motion.css` / `motion.js` – scroll and hover animations (slow intro, headline reveals, curtain image reveals, gentle parallax, cross-dissolve carousels). Switched off automatically for visitors who prefer reduced motion.
- `assets/` – images and icons exported from Figma

To do before launch:
- Hero and "Feel like your best self" use still frames from the Figma videos. Swap in the real video files (a `<video>` in `.hero` is already wired to the pause/sound buttons in main.js).
- FAQ answers marked "Answer to be confirmed" need copy.
- Connect the newsletter form to your email platform (see TODO in main.js).
- Add the WhatsApp number to the `wa.me/` link.
