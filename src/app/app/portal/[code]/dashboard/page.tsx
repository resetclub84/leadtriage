'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import XPBadge from '@/components/XPBadge';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default function PortalDashboard({ params }: PageProps) {
    const { code } = use(params);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        // In a real app we'd fetch by code, but here we need to mock or reuse API
        // For MVP/Demo purposes, we'll assume the code logic works and fetching by ID/Code is handled
        const fetchByCode = async () => {
            // Implementar fetch real aqui
        };
        fetchByCode();
    }, [code]);

    return (
        <div className="p-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Olá, Atleta</h1>
                    <p className="text-zinc-500 text-sm">Quarta, 17 Dez</p>
                </div>
                <XPBadge level="bronze" totalXP={350} size="sm" />
            </header>

            {/* Main Status */}
            <section className="mb-8">
                <h2 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Seu Progresso</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-blue-500">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium">Peso Atual</span>
                        </div>
                        <p className="text-2xl font-bold text-white">84.5 <span className="text-sm text-zinc-500">kg</span></p>
                        <p className="text-xs text-green-500 mt-1">-2.5kg este mês</p>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-yellow-500">
                            <Trophy className="w-5 h-5" />
                            <span className="text-sm font-medium">Próximo Nível</span>
                        </div>
                        <p className="text-2xl font-bold text-white">150 <span className="text-sm text-zinc-500">XP</span></p>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2">
                            <div className="bg-yellow-500 h-1.5 rounded-full w-[70%]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-8">
                <h2 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Ações Rápidas</h2>
                <button className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold">Fazer Check-in Semanal</p>
                            <p className="text-blue-200 text-xs">Ganhe +10 XP</p>
                        </div>
                    </div>
                    <ChevronRight className="text-white/50 group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Milestones Preview */}
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Últimas Conquistas</h2>
                    <button className="text-blue-500 text-xs font-medium">Ver todas</button>
                </div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                            <div className="text-2xl">🔥</div>
                            <div>
                                <p className="text-white text-sm font-medium">5kg Perdidos!</p>
                                <p className="text-zinc-500 text-xs">Há 2 dias</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
