
'use client';

import { useState } from 'react';
import { Crown, Check, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function UpgradePage({ params }: { params: Promise<{ code: string }> }) {
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState<string>('');

    // Get code from params
    useState(() => {
        params.then(p => setCode(p.code));
    });

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: code })
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Erro ao iniciar checkout: ' + (data.error || 'Tente novamente'));
            }
        } catch (error) {
            alert('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { name: 'Visualizar Protocolo', free: true, pro: true },
        { name: 'Check-ins Diários', free: true, pro: true },
        { name: 'Coach IA 24/7', free: false, pro: true },
        { name: 'Galeria de Evolução', free: false, pro: true },
        { name: 'Comunidade RESET', free: false, pro: true },
        { name: 'Suporte Prioritário', free: false, pro: true },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <Link href={`/app/portal/${code}/dashboard`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </Link>

            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30"
                >
                    <Crown className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Seja PRO</h1>
                <p className="text-zinc-400">Desbloqueie todo o potencial do RESET</p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-4 max-w-md mx-auto">
                {/* Free Plan */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <h3 className="font-semibold text-lg mb-1">Gratuito</h3>
                    <p className="text-zinc-500 text-sm mb-4">Seu plano atual</p>
                    <div className="space-y-2">
                        {features.filter(f => f.free).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                <Check className="w-4 h-4 text-green-500" />
                                {f.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pro Plan */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMENDADO
                    </div>
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        PRO
                    </h3>
                    <div className="mb-4">
                        <span className="text-3xl font-bold">R$ 49,90</span>
                        <span className="text-zinc-400 text-sm">/mês</span>
                    </div>
                    <div className="space-y-2 mb-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <Check className={`w-4 h-4 ${f.pro ? 'text-green-500' : 'text-zinc-600'}`} />
                                <span className={f.pro ? 'text-white' : 'text-zinc-600'}>{f.name}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Crown className="w-5 h-5" />
                                Assinar Agora
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-zinc-500 mt-3">
                        Cancele quando quiser. Sem compromisso.
                    </p>
                </motion.div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 text-center text-xs text-zinc-500 space-y-1">
                <p>🔒 Pagamento seguro via Stripe</p>
                <p>💳 Cartão, PIX ou Boleto</p>
            </div>
        </div>
    );
}
