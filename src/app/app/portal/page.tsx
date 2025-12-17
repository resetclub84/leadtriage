'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

export default function PortalLoginPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/portal/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/app/portal/${code}/dashboard`);
            } else {
                setError(data.error || 'Código inválido');
            }
        } catch (err) {
            setError('Erro ao conectar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#050505]">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm"
            >
                {/* Logo */}
                <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <span className="text-white font-bold text-2xl italic">RESET</span>
                </div>

                <h1 className="text-2xl font-bold text-center text-white mb-2">
                    Bem-vindo de volta
                </h1>
                <p className="text-gray-400 text-center mb-8">
                    Digite seu código de acesso para entrar
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white text-3xl font-bold text-center py-6 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none tracking-[0.5em] placeholder-zinc-700 transition-all"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-center text-sm font-medium"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${loading || code.length < 6
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Acessar Portal <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            <p className="fixed bottom-8 text-zinc-600 text-xs text-center">
                Não tem um código? Entre em contato com seu médico.
            </p>
        </div>
    );
}
