
import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY não configurada');
        }
        _stripe = new Stripe(key, { typescript: true });
    }
    return _stripe;
}

// Keep old export for backward compatibility (but will throw if used without key)
export const stripe = {
    get checkout() { return getStripe().checkout; },
    get subscriptions() { return getStripe().subscriptions; },
    get customers() { return getStripe().customers; },
    get webhooks() { return getStripe().webhooks; },
};

// Price IDs (Configure in Stripe Dashboard)
export const PRICES = {
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
};

// Plan configuration
export const PLANS = {
    FREE: {
        name: 'Gratuito',
        features: ['Visualizar Protocolo', 'Check-ins básicos'],
        price: 0,
    },
    PRO: {
        name: 'PRO',
        features: [
            'Tudo do Gratuito',
            'Coach IA 24/7',
            'Galeria de Evolução',
            'Comunidade RESET',
            'Suporte prioritário',
        ],
        price: 49.90,
    },
};
