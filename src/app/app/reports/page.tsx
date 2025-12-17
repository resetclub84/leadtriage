'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Table as TableIcon, AlertCircle, ChevronDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Safe Math Helper
const safeConversion = (won: number, total: number) => {
    if (!total || total === 0) return 0;
    return ((won / total) * 100).toFixed(1);
};

export default function ReportsPage() {
    // Mock Data State
    const [data] = useState([
        { source: 'whatsapp', leads: 42, triaged: 40, won: 12 },
        { source: 'instagram', leads: 85, triaged: 65, won: 8 },
        { source: 'google_ads', leads: 156, triaged: 156, won: 5 },
        { source: 'organic', leads: 30, triaged: 15, won: 3 },
    ]);

    const [isGoalDetailsOpen, setIsGoalDetailsOpen] = useState(false);

    // Mock Goal Data
    const goalData = {
        current: 145000,
        target: 177000, // Derived from current + missing (145k + 32k)
        missing: 32000,
        currency: 'R$'
    };

    const progressPercentage = goalData.target ? (goalData.current / goalData.target) * 100 : 0;

    const handleExport = () => {
        if (data.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }
        alert("Download iniciado (Mock)");
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-semibold text-primary">Reports & Analytics</h1>
                    <p className="text-muted text-sm mt-2">Performance por canal e exportação de dados.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={data.length === 0}
                    className="border-border bg-surface hover:bg-surface-2 text-text"
                >
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* LEFT: Goal Panel (Premium) */}
                <div
                    className="lg:col-span-1 bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:bg-[rgba(15,22,36,0.95)] group"
                >
                    {/* A) Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-accent" />
                                <h3 className="text-lg font-serif text-text tracking-wide">Meta do Mês</h3>
                            </div>
                            <p className="text-xs text-muted/80">Progresso atual e gap</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-border-strong text-muted">
                            Dezembro
                        </Badge>
                    </div>

                    {/* B) KPI Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Receita</p>
                            <span className="text-lg font-semibold text-text tabular-nums">
                                {goalData.current ? `145k` : '—'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Faltam</p>
                            <span className="text-lg font-semibold text-muted tabular-nums">
                                {goalData.missing ? `32k` : '—'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Progresso</p>
                            <span className="text-lg font-semibold text-accent tabular-nums">
                                {progressPercentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* C) Progress Section */}
                    <div className="space-y-2">
                        <div className="relative h-3 w-full bg-surface-2 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent/80 transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                {/* Glow Effect at tip */}
                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 blur-[2px]" />
                            </div>
                            {/* Target Marker */}
                            <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-accent/30" />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted opacity-80">
                            <span>R$ 0</span>
                            {goalData.target && <span>Projeção: R$ {goalData.target.toLocaleString()}</span>}
                        </div>
                    </div>

                    {/* Details Toggle */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <button
                            onClick={() => setIsGoalDetailsOpen(!isGoalDetailsOpen)}
                            className="flex items-center gap-2 text-xs text-muted hover:text-text transition-colors w-full justify-center opacity-80 hover:opacity-100"
                        >
                            Detalhes
                            <ChevronDown className={cn("w-3 h-3 transition-transform", isGoalDetailsOpen && "rotate-180")} />
                        </button>

                        {/* Collapse Content */}
                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out overflow-hidden",
                            isGoalDetailsOpen ? "grid-rows-[1fr] mt-4 opacity-100" : "grid-rows-[0fr] mt-0 opacity-0"
                        )}>
                            <div className="min-h-0 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Meta Definida</span>
                                    <span className="text-text font-medium">R$ {goalData.target?.toLocaleString() ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Média Diária Nec.</span>
                                    <span className="text-text font-medium text-xs">(opcional ao ativar calendário)</span>
                                </div>
                                {(!goalData.current || !goalData.target) && (
                                    <p className="text-xs text-red-400 pt-2">Dados insuficientes para projeção.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Table (Existing but styled to match) */}
                <div className="lg:col-span-2">
                    <Card className="border-[rgba(255,255,255,0.08)] bg-surface shadow-none h-full">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-surface">
                                <div className="flex items-center gap-2">
                                    <TableIcon className="w-4 h-4 text-primary" />
                                    <h3 className="font-serif font-medium text-text">Canais de Aquisição</h3>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)]">
                                        <tr>
                                            <th className="p-4 font-medium text-muted uppercase text-[10px] tracking-wider">Origem</th>
                                            <th className="p-4 font-medium text-muted uppercase text-[10px] tracking-wider">Leads</th>
                                            <th className="p-4 font-medium text-muted uppercase text-[10px] tracking-wider">Triados</th>
                                            <th className="p-4 font-medium text-muted uppercase text-[10px] tracking-wider">Won</th>
                                            <th className="p-4 font-medium text-muted uppercase text-[10px] tracking-wider">Conv.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)] bg-surface">
                                        {data.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <AlertCircle className="w-8 h-8 opacity-20" />
                                                        <p>Nenhum dado encontrado.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            data.map((row) => {
                                                const convRate = parseFloat(safeConversion(row.won, row.leads) as string);
                                                return (
                                                    <tr key={row.source} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                                                        <td className="p-4 font-medium text-primary capitalize group-hover:text-primary-hover transition-colors">
                                                            {row.source === 'google_ads' ? 'Google Ads' : row.source.replace('_', ' ')}
                                                        </td>
                                                        <td className="p-4 text-text/80">{row.leads}</td>
                                                        <td className="p-4 text-text/80">{row.triaged}</td>
                                                        <td className="p-4 text-text/80">{row.won}</td>
                                                        <td className="p-4">
                                                            <Badge variant={
                                                                convRate > 15 ? 'success' :
                                                                    convRate > 5 ? 'warning' : 'secondary'
                                                            } className="text-[10px] px-1.5 h-5">
                                                                {convRate}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
