'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users, TrendingUp, UserPlus, Star, ArrowUpRight,
    Phone, Mail, Calendar, CheckCircle, Clock, Crown
} from 'lucide-react';

interface ReferralData {
    referrals: any[];
    stats: {
        total: number;
        invited: number;
        clicked: number;
        leads: number;
        scheduled: number;
        converted: number;
        conversionRate: number;
    };
    topReferrers: any[];
}

export default function ReferralsPage() {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/referrals');
        if (res.ok) {
            const referralData = await res.json();
            setData(referralData);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24"></div>)}
                </div>
            </div>
        );
    }

    const stats = data?.stats || { total: 0, invited: 0, clicked: 0, leads: 0, scheduled: 0, converted: 0, conversionRate: 0 };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-serif font-semibold">Indicações</h1>
                <p className="text-muted text-sm">Dashboard de referrals do programa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    iconColor="text-indigo-400"
                    bgColor="bg-indigo-500/10"
                    value={stats.total}
                    label="Total de Indicações"
                />
                <StatCard
                    icon={UserPlus}
                    iconColor="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                    value={stats.leads}
                    label="Leads Gerados"
                />
                <StatCard
                    icon={CheckCircle}
                    iconColor="text-amber-400"
                    bgColor="bg-amber-500/10"
                    value={stats.converted}
                    label="Convertidos"
                />
                <StatCard
                    icon={TrendingUp}
                    iconColor="text-pink-400"
                    bgColor="bg-pink-500/10"
                    value={`${stats.conversionRate}%`}
                    label="Taxa de Conversão"
                />
            </div>

            {/* Funil */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Funil de Indicações</h3>
                <div className="flex items-center justify-between gap-4">
                    <FunnelStep label="Convidados" value={stats.invited} color="slate" width="100%" />
                    <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <FunnelStep label="Clicaram" value={stats.clicked} color="indigo" width={`${stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0}%`} />
                    <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <FunnelStep label="Leads" value={stats.leads} color="amber" width={`${stats.total > 0 ? (stats.leads / stats.total) * 100 : 0}%`} />
                    <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <FunnelStep label="Agendaram" value={stats.scheduled} color="emerald" width={`${stats.total > 0 ? (stats.scheduled / stats.total) * 100 : 0}%`} />
                    <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <FunnelStep label="Convertidos" value={stats.converted} color="pink" width={`${stats.total > 0 ? (stats.converted / stats.total) * 100 : 0}%`} />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Referrers */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400" />
                        Top Indicadores
                    </h3>
                    {data?.topReferrers && data.topReferrers.length > 0 ? (
                        <div className="space-y-3">
                            {data.topReferrers.map((referrer: any, index: number) => (
                                <div
                                    key={referrer.patient.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                index === 2 ? 'bg-orange-700/20 text-orange-500' :
                                                    'bg-white/5 text-slate-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <Link
                                            href={`/app/patients/${referrer.patient.id}`}
                                            className="font-medium text-white hover:text-indigo-400"
                                        >
                                            {referrer.patient.name}
                                        </Link>
                                        <p className="text-xs text-muted">{referrer.patient.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">{referrer.total}x</p>
                                        <p className="text-xs text-emerald-400">{referrer.converted} convertidos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted py-8">Nenhuma indicação ainda</p>
                    )}
                </div>

                {/* Indicações Recentes */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        Indicações Recentes
                    </h3>
                    {data?.referrals && data.referrals.length > 0 ? (
                        <div className="space-y-3">
                            {data.referrals.slice(0, 5).map((referral: any) => (
                                <div
                                    key={referral.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${referral.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-400' :
                                            referral.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-400' :
                                                referral.status === 'LEAD' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    'bg-slate-500/10 text-slate-400'
                                        }`}>
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{referral.referredName}</p>
                                        <p className="text-xs text-muted">
                                            Por {referral.referrer?.name?.split(' ')[0]}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${referral.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                referral.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-400' :
                                                    referral.status === 'LEAD' ? 'bg-indigo-500/10 text-indigo-400' :
                                                        'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {referral.status}
                                        </span>
                                        <p className="text-xs text-muted mt-1">
                                            {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted py-8">Nenhuma indicação ainda</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, bgColor, value, label }: any) {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-muted">{label}</p>
                </div>
            </div>
        </div>
    );
}

function FunnelStep({ label, value, color, width }: { label: string; value: number; color: string; width: string }) {
    const colorMap: any = {
        slate: 'bg-slate-500',
        indigo: 'bg-indigo-500',
        amber: 'bg-amber-500',
        emerald: 'bg-emerald-500',
        pink: 'bg-pink-500'
    };

    return (
        <div className="flex-1">
            <div className="text-center mb-2">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-muted">{label}</p>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
                    style={{ width: width === '100%' ? '100%' : `${Math.max(5, parseFloat(width))}%` }}
                />
            </div>
        </div>
    );
}
