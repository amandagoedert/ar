/**
 * Liga itens de produto a página de detalhes e garante que a ação de
 * adicionar ao carrinho funcione nas vitrines da loja.
 */
(() => {
  const CART_KEY = 'tiktokShopCart';
  const DETAIL_PATH = window.PRODUCT_DETAIL_PATH || '../Index.html';

  function buildDetailUrl(productId) {
    if (!productId) return DETAIL_PATH;
    const separator = DETAIL_PATH.includes('?') ? '&' : '?';
    return `${DETAIL_PATH}${separator}id=${encodeURIComponent(productId)}`;
  }

  function parsePrice(text) {
    if (!text) return 0;
    const cleaned = text
      .toString()
      .replace(/\s/g, '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function getCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Não foi possível carregar o carrinho salvo', error);
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Não foi possível salvar o carrinho', error);
    }
  }

  function extractProductData(card) {
    const id = card.dataset.productId || card.getAttribute('data-id') || '';
    const title = card.querySelector('.title, .product-title, h3')?.textContent?.trim() || 'Produto';
    const priceLabel = card.querySelector('.price-current, .product-price, .price')?.textContent?.trim() || '';
    const oldPriceLabel = card.querySelector('.price-old, .product-price-old')?.textContent?.trim() || '';
    const imageEl = card.querySelector('img');
    const imageSrc = imageEl?.getAttribute('src') || '';

    const price = parsePrice(priceLabel) || 0;

    return {
      id: id || `produto-${Date.now()}`,
      name: title,
      price,
      priceLabel,
      oldPrice: parsePrice(oldPriceLabel) || null,
      oldPriceLabel,
      image: imageSrc,
    };
  }

  function navigateToProduct(card) {
    const productId = card.dataset.productId;
    window.location.href = buildDetailUrl(productId);
  }

  function addToCartFromCard(card) {
    const product = extractProductData(card);
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      existing.price = product.price;
      existing.name = product.name;
      existing.image = product.image || existing.image;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    saveCart(cart);
    card.classList.add('added-to-cart');
    setTimeout(() => card.classList.remove('added-to-cart'), 400);
  }

  function bindCard(card) {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.btn-cart')) return;
      if (event.target.closest('.btn-buy')) return;
      navigateToProduct(card);
    });

    const buyButton = card.querySelector('.btn-buy');
    if (buyButton) {
      buyButton.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToProduct(card);
      });
    }

    const cartButton = card.querySelector('.btn-cart');
    if (cartButton) {
      cartButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCartFromCard(card);
      });
    }
  }

  function initProductLinker() {
    document.querySelectorAll('.product-card[data-product-id]').forEach(bindCard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductLinker);
  } else {
    initProductLinker();
  }
})();
