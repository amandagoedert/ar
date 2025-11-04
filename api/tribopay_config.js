// Configuração TriboPay - Node.js version
// ATENÇÃO: Não comite tokens em repositórios públicos.
// Configure TRIBOPAY_API_TOKEN como variável de ambiente na Vercel e em .env local.

const VERCE_URL = (process.env.VERCEL_URL || '').replace(/^https?:\/\//, '');

export default {
    // Credenciais TriboPay (use env var)
    api_token: process.env.TRIBOPAY_API_TOKEN || '',

    // Offer e Product padrão (podem vir por env var se quiser parametrizar)
    default_offer_hash: process.env.DEFAULT_OFFER_HASH || 'ugg3tvujyf',
    default_product_hash: process.env.DEFAULT_PRODUCT_HASH || '5crbkjmnrj',

    // Configurações de itens do carrinho
    products: {},

    default_operation_type: 1,
    default_tangible: true,

    // URL de postback: em Vercel, VERCEL_URL aponta para o domínio do deploy
    postback_url: process.env.POSTBACK_URL
        || (VERCE_URL ? `https://${VERCE_URL}/api/webhook` : '')
};
