'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    TrendingUp, Users, Trophy, Scale, Star,
    Award, BarChart3, TrendingDown, Crown
} from 'lucide-react';

interface PortfolioData {
    stats: {
        totalPatients: number;
        patientsWithProgress: number;
        totalWeightLoss: number;
        avgWeightLoss: number;
        totalMilestones: number;
        successStoriesCount: number;
    };
    distribution: {
        under5kg: number;
        from5to10kg: number;
        from10to15kg: number;
        from15to20kg: number;
        over20kg: number;
    };
    successStories: any[];
    recentMilestones: any[];
}

export default function PortfolioPage() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
            const portfolioData = await res.json();
            setData(portfolioData);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-32"></div>)}
                </div>
            </div>
        );
    }

    const stats = data?.stats || { totalPatients: 0, patientsWithProgress: 0, totalWeightLoss: 0, avgWeightLoss: 0, totalMilestones: 0, successStoriesCount: 0 };
    const distribution = data?.distribution || { under5kg: 0, from5to10kg: 0, from10to15kg: 0, from15to20kg: 0, over20kg: 0 };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-serif font-semibold flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-indigo-400" />
                    ResultOS — Portfolio de Resultados
                </h1>
                <p className="text-muted text-sm">Prova de valor agregada de todos os pacientes</p>
            </div>

            {/* Stats Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingDown className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.totalWeightLoss}kg</p>
                            <p className="text-sm text-muted">Total peso perdido</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                            <Scale className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.avgWeightLoss}kg</p>
                            <p className="text-sm text-muted">Média por paciente</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.totalMilestones}</p>
                            <p className="text-sm text-muted">Conquistas desbloqueadas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribuição de Resultados */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Distribuição de Resultados
                </h3>
                <div className="space-y-4">
                    <DistributionBar label="< 5kg" value={distribution.under5kg} max={stats.patientsWithProgress || 1} color="slate" />
                    <DistributionBar label="5-10kg" value={distribution.from5to10kg} max={stats.patientsWithProgress || 1} color="indigo" />
                    <DistributionBar label="10-15kg" value={distribution.from10to15kg} max={stats.patientsWithProgress || 1} color="emerald" />
                    <DistributionBar label="15-20kg" value={distribution.from15to20kg} max={stats.patientsWithProgress || 1} color="amber" />
                    <DistributionBar label="> 20kg" value={distribution.over20kg} max={stats.patientsWithProgress || 1} color="pink" />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Success Stories */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        Top Transformações
                    </h3>
                    {data?.successStories && data.successStories.length > 0 ? (
                        <div className="space-y-3">
                            {data.successStories.slice(0, 5).map((story: any, index: number) => (
                                <Link
                                    key={story.id}
                                    href={`/app/patients/${story.id}/journey`}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                index === 2 ? 'bg-orange-700/20 text-orange-500' :
                                                    'bg-white/5 text-slate-500'
                                        }`}>
                                        {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{story.name}</p>
                                        <p className="text-xs text-muted">
                                            {story.initialWeight}kg → {story.currentWeight}kg
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-emerald-400">-{story.weightLoss}kg</p>
                                        <p className="text-xs text-muted">{story.milestones} conquistas</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted py-8">
                            Ainda não há cases de sucesso. Configure os dados dos pacientes para começar.
                        </p>
                    )}
                </div>

                {/* Milestones Recentes */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-pink-400" />
                        Conquistas Recentes
                    </h3>
                    {data?.recentMilestones && data.recentMilestones.length > 0 ? (
                        <div className="space-y-3">
                            {data.recentMilestones.map((milestone: any) => (
                                <div
                                    key={milestone.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                                >
                                    <span className="text-2xl">{milestone.badgeIcon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white">{milestone.title}</p>
                                        <Link
                                            href={`/app/patients/${milestone.patient.id}/journey`}
                                            className="text-xs text-indigo-400 hover:text-indigo-300"
                                        >
                                            {milestone.patient.name}
                                        </Link>
                                    </div>
                                    <p className="text-xs text-muted">
                                        {new Date(milestone.achievedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted py-8">
                            Nenhuma conquista ainda
                        </p>
                    )}
                </div>
            </div>

            {/* Stats Secundários */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.totalPatients}</p>
                    <p className="text-xs text-muted">Pacientes cadastrados</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.patientsWithProgress}</p>
                    <p className="text-xs text-muted">Com progresso</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.successStoriesCount}</p>
                    <p className="text-xs text-muted">Cases de sucesso</p>
                </div>
            </div>
        </div>
    );
}

function DistributionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const colorMap: any = {
        slate: 'bg-slate-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        pink: 'bg-pink-500'
    };

    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-medium text-white">{value} pacientes</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                />
            </div>
        </div>
    );
}
