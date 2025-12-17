'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertCircle, Trophy, Activity } from "lucide-react";

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

    if (loading) return <div className="p-8">Loading Control Tower...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-semibold text-primary">Control Tower</h1>
                <p className="text-muted text-sm mt-2">Visão geral da operação e governança.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Leads" value={stats?.overview.totalLeads} icon={Users} trend="+12% essa semana" />
                <KPICard title="Pendente (SLA)" value={stats?.overview.slaBreached} icon={AlertCircle} className="border-danger/20 bg-danger/5" valueColor="text-danger" />
                <KPICard title="Em Triagem" value={stats?.funnel.TRIAGING} icon={Activity} />
                <KPICard title="Conversão (Won)" value={stats?.funnel.WON} icon={Trophy} className="border-success/20 bg-success/5" valueColor="text-success" />
            </div>

            {/* Funnel Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Funil de Vendas</CardTitle>
                        <CardDescription>Distribuição de leads por etapa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <FunnelBar label="Novos" value={stats?.funnel.NEW} total={stats?.overview.totalLeads} color="bg-primary/20" />
                            <FunnelBar label="Em Triagem" value={stats?.funnel.TRIAGING} total={stats?.overview.totalLeads} color="bg-primary/40" />
                            <FunnelBar label="Contactados" value={stats?.funnel.CONTACTED} total={stats?.overview.totalLeads} color="bg-primary/60" />
                            <FunnelBar label="Agendados" value={stats?.funnel.SCHEDULED} total={stats?.overview.totalLeads} color="bg-primary/80" />
                            <FunnelBar label="Fechados" value={stats?.funnel.WON} total={stats?.overview.totalLeads} color="bg-success" />
                            <FunnelBar label="Perdidos" value={stats?.funnel.LOST} total={stats?.overview.totalLeads} color="bg-danger/40" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Needs Attention (SLA)</CardTitle>
                        <CardDescription>Leads sem interação há mais de 24h</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted space-y-2">
                            <AlertCircle className="w-10 h-10 opacity-20" />
                            <p>{stats?.overview.slaBreached} leads atrasados</p>
                            <button className="text-primary text-sm underline font-medium">Ver lista de prioridade</button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, className, valueColor = "text-text" }: any) {
    return (
        <div className={`p-6 rounded-xl border border-border bg-surface shadow-sm ${className}`}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted">{title}</h3>
                <Icon className="h-4 w-4 text-muted" />
            </div>
            <div>
                <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
                {trend && <p className="text-xs text-muted mt-1">{trend}</p>}
            </div>
        </div>
    )
}

function FunnelBar({ label, value, total, color }: any) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-text">{label}</span>
                <span className="text-muted">{value} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
