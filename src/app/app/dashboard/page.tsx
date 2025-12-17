'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertCircle, Trophy, Activity, TrendingUp, Calendar } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="p-8 animate-fade-in">
            <div className="space-y-6">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32"></div>)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-serif font-semibold">Central de Comando</h1>
                <p className="text-muted text-sm mt-2">Visão geral da operação e métricas de conversão.</p>
            </div>

            {/* KPI Cards Premium */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total de Leads"
                    value={stats?.overview.totalLeads}
                    icon={Users}
                    trend="+12% esta semana"
                    iconColor="text-indigo-400"
                />
                <KPICard
                    title="Urgente (SLA)"
                    value={stats?.overview.slaBreached}
                    icon={AlertCircle}
                    isDanger
                    iconColor="text-rose-400"
                />
                <KPICard
                    title="Em Triagem"
                    value={stats?.funnel.TRIAGING}
                    icon={Activity}
                    iconColor="text-violet-400"
                />
                <KPICard
                    title="Convertidos"
                    value={stats?.funnel.WON}
                    icon={Trophy}
                    isSuccess
                    iconColor="text-emerald-400"
                />
            </div>

            {/* Funnel Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                            Funil de Vendas
                        </h3>
                        <p className="text-sm text-muted mt-1">Distribuição de leads por etapa</p>
                    </div>
                    <div className="space-y-4">
                        <FunnelBar label="Novos" value={stats?.funnel.NEW} total={stats?.overview.totalLeads} color="from-indigo-500 to-violet-500" />
                        <FunnelBar label="Em Triagem" value={stats?.funnel.TRIAGING} total={stats?.overview.totalLeads} color="from-violet-500 to-purple-500" />
                        <FunnelBar label="Contactados" value={stats?.funnel.CONTACTED} total={stats?.overview.totalLeads} color="from-purple-500 to-pink-500" />
                        <FunnelBar label="Agendados" value={stats?.funnel.SCHEDULED} total={stats?.overview.totalLeads} color="from-pink-500 to-rose-500" />
                        <FunnelBar label="Fechados" value={stats?.funnel.WON} total={stats?.overview.totalLeads} color="from-emerald-500 to-green-500" />
                        <FunnelBar label="Perdidos" value={stats?.funnel.LOST} total={stats?.overview.totalLeads} color="from-slate-500 to-slate-600" />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-rose-400" />
                            Atenção Imediata
                        </h3>
                        <p className="text-sm text-muted mt-1">Leads sem interação há mais de 24h</p>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.overview.slaBreached}</p>
                        <p className="text-sm text-muted">leads aguardando resposta</p>
                        <button className="premium-button text-sm py-2 px-4 h-auto">
                            Ver Lista de Prioridade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, isDanger, isSuccess, iconColor = "text-indigo-400" }: any) {
    return (
        <div className={`glass-card p-5 ${isDanger ? 'border-rose-500/30' : ''} ${isSuccess ? 'border-emerald-500/30' : ''}`}>
            <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="tracking-tight text-sm font-medium text-muted">{title}</h3>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                    ${isDanger ? 'bg-rose-500/10' : isSuccess ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
            <div>
                <div className={`text-3xl font-bold ${isDanger ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-white'}`}>
                    {value ?? 0}
                </div>
                {trend && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {trend}
                </p>}
            </div>
        </div>
    )
}

function FunnelBar({ label, value, total, color }: any) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-white">{label}</span>
                <span className="text-muted">{value ?? 0} ({percentage}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                />
            </div>
        </div>
    )
}

