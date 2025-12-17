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
    payments: any[];
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

                {/* Chat Interface */}
                <Card className="border-primary/20 shadow-lg">
                    <CardHeader className="bg-surface-2 border-b border-border py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageSquare className="w-5 h-5 text-success" />
                                WhatsApp
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] tracking-widest text-muted">OFFICIAL API</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Messages Area */}
                        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[url('/chat-bg-dark.png')] bg-repeat bg-[length:300px]">
                            {lead.events
                                ?.filter((e: any) => ['MESSAGE_RECEIVED', 'MESSAGE_SENT'].includes(e.type))
                                .length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
                                    <MessageSquare className="w-12 h-12 mb-2" />
                                    <p>Nenhuma mensagem ainda.</p>
                                </div>
                            ) : (
                                lead.events
                                    ?.filter((e: any) => ['MESSAGE_RECEIVED', 'MESSAGE_SENT'].includes(e.type))
                                    // Sort by date asc for chat flow
                                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                    .map((msg: any) => {
                                        const isMe = msg.type === 'MESSAGE_SENT';
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                                                    : 'bg-surface text-text border border-border rounded-tl-none'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.payload}</p>
                                                    <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted'}`}>
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                        {isMe && <span className="ml-1">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-surface border-t border-border flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Digite uma mensagem..."
                                    className="w-full bg-background border border-border rounded-full py-2 px-4 focus:outline-none focus:border-success text-sm"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            const val = e.currentTarget.value;
                                            e.currentTarget.value = ''; // Optimistic clear
                                            await fetch('/api/whatsapp/send', {
                                                method: 'POST',
                                                body: JSON.stringify({ leadId: lead.id, message: val })
                                            });
                                            logEvent('MESSAGE_SENT', val); // Optimistic UI update
                                        }
                                    }}
                                />
                            </div>
                            <Button size="icon" className="rounded-full bg-success hover:bg-success/90">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline (Original) */}
                <Card className="opacity-80">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="flex items-center gap-2 text-sm text-muted"><History className="w-4 h-4" /> Histórico Completo</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-6 relative border-l border-border ml-2 pl-6 py-2">
                            {lead.events?.filter(e => !['MESSAGE_RECEIVED', 'MESSAGE_SENT'].includes(e.type)).map((event: any) => (
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
                {/* Payment Card */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-secondary">Pagamentos</CardTitle>
                        <CardDescription>Cobrar pré-agendamento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                            <span className="text-sm font-medium">Status</span>
                            <Badge variant={lead.payments?.[0]?.status === 'PAID' ? 'success' : 'warning'}>
                                {lead.payments?.[0]?.status || 'NOT_STARTED'}
                            </Badge>
                        </div>

                        {!lead.payments?.length ? (
                            <Button
                                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                                onClick={async () => {
                                    const res = await fetch('/api/payments/checkout', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ leadId: lead.id })
                                    });
                                    const data = await res.json();
                                    if (data.checkoutUrl) {
                                        // Open in new tab or copy? Open for now to test
                                        window.open(data.checkoutUrl, '_blank');
                                        fetchData(); // Refresh to show pending status
                                    }
                                }}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Gerar Link (R$ 100)
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-muted text-center">Checkout criado em {format(new Date(lead.payments[0].createdAt), 'dd/MM HH:mm')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
