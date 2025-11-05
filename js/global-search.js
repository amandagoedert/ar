/**
 * Regras simples de busca utilizadas nas páginas da loja.
 * Quando o formulário é enviado, redireciona para a tela de produtos com
 * o termo aplicado em ?q=. Também atualiza o armazenamento local para
 * reaplicar o termo automaticamente.
 */
(() => {
  const LAST_QUERY_KEY = 'tiktokShopLastSearch';

  function submitSearch(form, input) {
    if (!input) return;
    const term = input.value.trim();
    const target = form.dataset.searchTarget || 'produtos.html';
    const normalizedTarget = target.startsWith('http') ? target : `${target}`; // já é relativo

    try {
      if (term) {
        localStorage.setItem(LAST_QUERY_KEY, term);
      } else {
        localStorage.removeItem(LAST_QUERY_KEY);
      }
    } catch {
      /* storage pode falhar (privado) */
    }

    const url = new URL(normalizedTarget, window.location.href);
    if (term) {
      url.searchParams.set('q', term);
    } else {
      url.searchParams.delete('q');
    }
    window.location.href = url.toString();
  }

  function hydrateSearchInputs() {
    let lastQuery = '';
    try {
      lastQuery = localStorage.getItem(LAST_QUERY_KEY) || '';
    } catch (error) {
      lastQuery = '';
    }

    if (!lastQuery) return;
    document
      .querySelectorAll('[data-search-input]')
      .forEach((input) => {
        if (!input.value) {
          input.value = lastQuery;
        }
      });
  }

  function initSearchForms() {
    document
      .querySelectorAll('form[data-search-form]')
      .forEach((form) => {
        const input = form.querySelector('[data-search-input]');
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          submitSearch(form, input);
        });
        if (input) {
          input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitSearch(form, input);
            }
          });
        }
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    hydrateSearchInputs();
    initSearchForms();
  });
})();
