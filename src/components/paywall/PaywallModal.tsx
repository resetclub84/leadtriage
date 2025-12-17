'use client';

import { X, Crown, Sparkles, Camera, MessageCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export default function PaywallModal({ isOpen, onClose, featureName = 'Este recurso' }: PaywallModalProps) {
    if (!isOpen) return null;

    const features = [
        { icon: <MessageCircle className="w-5 h-5" />, title: 'Coach IA 24/7', desc: 'Tire dúvidas a qualquer hora' },
        { icon: <Camera className="w-5 h-5" />, title: 'Galeria de Evolução', desc: 'Registre seu progresso visual' },
        { icon: <Users className="w-5 h-5" />, title: 'Comunidade RESET', desc: 'Conecte-se com a tribo' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gradient-to-b from-zinc-900 to-black rounded-3xl max-w-md w-full p-6 border border-zinc-700 shadow-2xl shadow-blue-500/10 overflow-hidden relative"
                >
                    {/* Decorative Glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />

                    <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-6 relative z-10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Desbloqueie o PRO</h2>
                        <p className="text-zinc-400 text-sm">{featureName} é exclusivo para assinantes.</p>
                    </div>

                    <div className="space-y-3 mb-6 relative z-10">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{f.title}</p>
                                    <p className="text-zinc-500 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 relative z-10">
                        <a
                            href={`/app/portal/${window.location.pathname.split('/')[3]}/upgrade`}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                        >
                            <Sparkles className="w-5 h-5" />
                            Ver Planos PRO
                        </a>
                        <p className="text-center text-xs text-zinc-500">
                            Cancele quando quiser. Sem compromisso.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
