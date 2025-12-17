'use client';

import { useEffect, useState } from 'react';
import { Lead } from '@/types';
import { useParams } from 'next/navigation';
import { format, isValid, formatDistanceToNow } from 'date-fns';
import { ExternalLink, MessageSquare, AlertCircle, Copy, User, Phone, Mail, Tag, Clock, CheckCircle2, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ptBR } from 'date-fns/locale';

interface LeadDetail extends Lead {
    events: any[];
    assignedTo?: { id: string, name: string };
}

export default function LeadDetailPage() {
    const { id } = useParams();
    const [lead, setLead] = useState<LeadDetail | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [playbooks, setPlaybooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const [leadRes, usersRes, playbooksRes] = await Promise.all([
            fetch(`/api/leads/${id}`),
            fetch('/api/users'),
            fetch('/api/playbooks')
        ]);

        const leadData = await leadRes.json();
        setLead(leadData);
        setUsers(await usersRes.json());
        setPlaybooks(await playbooksRes.json());
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const logEvent = async (type: string, payload: any = {}) => {
        await fetch(`/api/leads/${id}/timeline`, {
            method: 'POST',
            body: JSON.stringify({ type, payload })
        });
        fetchData(); // Refresh to show new event
    };

    const handleOwnerChange = async (userId: string) => {
        await logEvent('OWNER_CHANGED', { newOwnerId: userId });
    };

    const handleLogContact = async (method: string) => {
        await logEvent('CONTACT_LOGGED', { method });
    };

    const updateStatus = async (newStatus: string) => {
        await fetch(`/api/leads/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        logEvent('STATUS_CHANGED', { from: lead?.status, to: newStatus });
    };

    const suggestedPlaybooks = playbooks.filter(p => p.intent === lead?.triage?.intent);

    if (loading || !lead) return <div className="text-muted p-8">Loading Control Tower...</div>;

    const whatsappLink = lead.phone ? `https://wa.me/55${lead.phone.replace(/\D/g, '')}` : null;

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Triage & Content */}
            <div className="space-y-8 lg:col-span-2">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">
                            {lead.name || 'Unknown Lead'}
                        </h1>
                        <Badge variant={lead.status === 'NEW' ? 'gold' : 'secondary'}>{lead.status}</Badge>
                    </div>
                    <div className="text-sm text-muted flex items-center gap-2">
                        <span>Via {lead.source}</span>
                        <span>•</span>
                        <span>Criado {isValid(new Date(lead.createdAt)) ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : '-'}</span>
                    </div>
                </div>

                {/* Triage Grid */}
                {lead.triage && (
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-surface">
                            <CardContent className="p-4">
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Score</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-primary uppercase">{lead.triage.lead_score}</span>
                                    <span className="text-sm text-muted">/ urgência {lead.triage.nivel_urgencia}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Intent</div>
                                <div className="text-lg font-medium text-text capitalize">{lead.triage.intent.replace(/_/g, ' ').toLowerCase()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Recommended Program</div>
                                <div className="text-lg font-bold text-accent">{lead.triage.indicacao_programa}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Probable Plan</div>
                                <div className="text-lg font-medium text-text">{lead.triage.provavel_plano.replace(/_/g, ' ')} months</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Timeline */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 relative border-l border-border ml-2 pl-6 py-2">
                            {lead.events?.map((event: any) => (
                                <div key={event.id} className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-surface"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-primary">{event.type.replace('_', ' ')}</span>
                                        <span className="text-xs text-muted mb-1">{format(new Date(event.createdAt), 'PP p')}</span>
                                        {event.payload && (
                                            <div className="text-sm bg-[rgba(255,255,255,0.02)] p-2 rounded-md border border-border mt-1 text-muted">
                                                <code>{event.payload}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Actions & Meta */}
            <div className="space-y-8">
                {/* Control Tower Card */}
                <Card className="border-accent/20 bg-[rgba(199,164,107,0.03)]">
                    <CardHeader>
                        <CardTitle className="text-accent">Control Tower</CardTitle>
                        <CardDescription>Governança e Próximos Passos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted uppercase">Owner</label>
                            <Select
                                value={lead.assignedTo?.id || ''}
                                onChange={(e) => handleOwnerChange(e.target.value)}
                                className="bg-surface"
                            >
                                <option value="">-- Assign --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted uppercase">Status</label>
                            <Select
                                value={lead.status}
                                onChange={(e) => updateStatus(e.target.value)}
                                className="bg-surface"
                            >
                                <option value="NEW">New</option>
                                <option value="TRIAGING">Triaging</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="WON">Won</option>
                                <option value="LOST">Lost</option>
                            </Select>
                        </div>

                        <div className="pt-4 border-t border-accent/20">
                            <label className="text-xs font-semibold text-muted uppercase mb-2 block">Log Contact</label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleLogContact('WhatsApp')}>
                                    <MessageSquare className="w-4 h-4 mr-2 text-success" /> WhatsApp
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleLogContact('Call')}>
                                    <Phone className="w-4 h-4 mr-2 text-primary" /> Call
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Playbooks Suggestion */}
                <Card>
                    <CardHeader>
                        <CardTitle>Next Best Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {suggestedPlaybooks.length > 0 ? (
                            suggestedPlaybooks.map(pb => (
                                <div key={pb.id} className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="font-semibold text-sm text-primary mb-1">{pb.title}</div>
                                    <div className="text-xs text-muted mb-2 line-clamp-2">"{pb.templateText}"</div>
                                    <Button variant="ghost" size="sm" className="w-full h-7 text-xs bg-surface shadow-sm text-text border border-border" onClick={() => navigator.clipboard.writeText(pb.templateText)}>
                                        <Copy className="w-3 h-3 mr-1" /> Copy Template
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted italic p-4 text-center bg-surface-2 rounded-lg border border-border">
                                Nenhum playbook específico para este lead.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
