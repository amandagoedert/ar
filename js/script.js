/**
 * Fallback utilities executed on páginas principais.
 * Este arquivo existe para evitar 404 no deploy e concentrar pequenos ajustes
 * de interação que são compartilhados entre páginas.
 */

(() => {
  function setupShareToggles() {
    const openers = document.querySelectorAll('[data-share-open]');
    const closers = document.querySelectorAll('[data-share-close]');
    const overlay = document.querySelector('#share-overlay');
    const section = document.querySelector('#share-section');

    if (!overlay || !section) {
      return;
    }

    const open = () => {
      section.classList.add('is-open');
      overlay.classList.add('is-open');
    };

    const close = () => {
      section.classList.remove('is-open');
      overlay.classList.remove('is-open');
    };

    openers.forEach((el) => el.addEventListener('click', open));
    closers.forEach((el) => el.addEventListener('click', close));
    overlay.addEventListener('click', close);
  }

  function enhanceBackLinks() {
    document.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = btn.getAttribute('href') || '/';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupShareToggles();
    enhanceBackLinks();
  });
})();
