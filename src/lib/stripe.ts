
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia', // Updating to a recent stable version or ignoring if key allows string
    typescript: true,
});

export function formatCurrency(amountCents: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amountCents / 100);
}
