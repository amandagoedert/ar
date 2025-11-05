import { loadProducts } from './products-data.js';

function toArray(map) {
  if (!map) return [];
  return Object.keys(map).map((key) => ({ id: key, ...map[key] }));
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  return value || 'Consultar';
}

function normalizeImage(path) {
  if (!path) return '/images/ndaq.png';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return `/${path.replace(/^\.?\//, '')}`;
}

function buildFeaturedCard(product) {
  return `
    <article class="featured-card flex flex-col gap-1" data-product-id="${product.id}">
      <div class="bg-white rounded-xl overflow-hidden shadow-sm aspect-[3/4]">
        <img src="${normalizeImage(product.image)}" alt="${product.title}" class="w-full h-full object-cover">
      </div>
      <span class="text-[12px] leading-4 text-gray-700 line-clamp-2">${product.title}</span>
      <span class="text-[13px] font-semibold text-rose-500">${formatPrice(product.price)}</span>
    </article>
  `;
}

function buildRecommendedCard(product) {
  return `
    <article class="recommended-card flex gap-3 bg-white rounded-xl overflow-hidden shadow-sm p-3" data-product-id="${product.id}">
      <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img src="${normalizeImage(product.image)}" alt="${product.title}" class="w-full h-full object-cover">
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <h3 class="text-[13px] font-medium text-gray-800 line-clamp-2 mb-1">${product.title}</h3>
          ${product.oldPrice ? `<span class="text-[12px] text-gray-400 line-through">${product.oldPrice}</span>` : ''}
        </div>
        <div class="flex items-center justify-between">
          <strong class="text-[15px] text-rose-500">${formatPrice(product.price)}</strong>
          <button type="button" class="btn-buy text-xs font-semibold text-white bg-rose-500 rounded-full px-3 py-1">
            Ver oferta
          </button>
        </div>
      </div>
    </article>
  `;
}

async function getProductsList() {
  try {
    const data = await loadProducts();
    return toArray(data.products);
  } catch (error) {
    console.warn('Não foi possível carregar produtos para a vitrine', error);
    return [];
  }
}

export async function renderFeatured(target) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  const products = await getProductsList();
  if (!products.length) {
    container.textContent = 'Produtos indisponíveis no momento';
    container.classList.add('text-sm', 'text-gray-500', 'text-center');
    return;
  }

  const cards = products.slice(0, 6).map(buildFeaturedCard).join('');
  container.innerHTML = cards;
}

export async function renderRecommended(target) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  const products = await getProductsList();
  if (!products.length) {
    container.innerHTML = `
      <div class="text-sm text-gray-500 text-center py-6">
        Não encontramos recomendações para agora. Tente novamente mais tarde.
      </div>
    `;
    return;
  }

  const cards = products.map(buildRecommendedCard).join('');
  container.innerHTML = cards;
}
