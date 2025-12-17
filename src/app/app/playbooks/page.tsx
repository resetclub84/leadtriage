'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, MessageSquare } from "lucide-react";

export default function PlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', intent: '', templateText: '' });

    useEffect(() => {
        fetchPlaybooks();
    }, []);

    const fetchPlaybooks = () => {
        fetch('/api/playbooks')
            .then(res => res.json())
            .then(data => setPlaybooks(data));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/playbooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowForm(false);
        setFormData({ title: '', intent: '', templateText: '' });
        fetchPlaybooks();
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-semibold text-primary">Playbooks</h1>
                    <p className="text-muted text-sm mt-2">Templates de mensagens e roteiros de vendas.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Playbook
                </Button>
            </div>

            {showForm && (
                <Card className="bg-surface border-accent/20">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Título (ex: Agendamento Frio)"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="bg-surface border-border"
                                />
                                <Input
                                    placeholder="Intenção (ex: AGENDAR_CONSULTA)"
                                    value={formData.intent}
                                    onChange={e => setFormData({ ...formData, intent: e.target.value })}
                                    required
                                    className="bg-surface border-border"
                                />
                            </div>
                            <textarea
                                className="premium-input h-24 pt-2 resize-none bg-surface border-border text-text placeholder:text-muted/50"
                                placeholder="Mensagem do template..."
                                value={formData.templateText}
                                onChange={e => setFormData({ ...formData, templateText: e.target.value })}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button type="submit">Salvar Playbook</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {playbooks.map(pb => (
                    <Card key={pb.id} className="hover:border-accent/50 transition-colors group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{pb.title}</CardTitle>
                                        <CardDescription className="text-xs mt-1">Intent: {pb.intent}</CardDescription>
                                    </div>
                                </div>
                                {pb.program && <Badge variant="gold">{pb.program}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-primary/5 p-4 rounded-lg border border-border text-sm text-text/80 italic relative">
                                <MessageSquare className="w-4 h-4 absolute top-4 left-3 text-accent opacity-50" />
                                <p className="pl-6">"{pb.templateText}"</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
