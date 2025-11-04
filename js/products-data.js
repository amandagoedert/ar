// Catálogo estático de produtos utilizado pela página principal e checkout.
const catalog = {
  'kit-coconut-passion-vs': {
    id: 'kit-coconut-passion-vs',
    title: 'Ar Condicionado Portátil 2 em 1',
    price: 'R$ 109,97',
    oldPrice: 'R$ 269,99',
    image: 'images/imgprincipal.png',
    productHash: '5crbkjmnrj',
    offerHash: 'ugg3tvujyf',
    gatewayName: 'Com ter a casa refrigerada o verao',
  },
  'kit-bare-vanilla-vs': {
    id: 'kit-bare-vanilla-vs',
    title: 'Kit Body Splash + Hidratante Bare Vanilla Aura Parfum',
    price: 'R$ 49,14',
    oldPrice: 'R$ 84,20',
    image: 'images/903dde3edca44f789847b972949bc7d2~tplv-aphluv4xwc-resize-jpeg_350_350.png',
  },
  'kit-pure-seduction-vs': {
    id: 'kit-pure-seduction-vs',
    title: 'Kit Body Splash + Hidratante Pure Seduction Aura Parfum',
    price: 'R$ 71,99',
    oldPrice: 'R$ 84,20',
    image: 'images/Gemini_Generated_Image_3y6npe3y6npe3y6n%20(1).jpeg',
  },
  'ar-condicionado-2em1': {
    id: 'ar-condicionado-2em1',
    title: 'Ar Condicionado Portátil 2 em 1',
    price: 'R$ 109,97',
    oldPrice: 'R$ 269,99',
    image: 'images/imgprincipal.png',
    productHash: '5crbkjmnrj',
    offerHash: 'ugg3tvujyf',
    gatewayName: 'Com ter a casa refrigerada o verao',
  },
};

export async function loadProducts() {
  return { products: catalog };
}

export function getProductById(id) {
  return catalog[id] || null;
}
