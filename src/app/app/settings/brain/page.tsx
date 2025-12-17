
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Save, Sparkles } from 'lucide-react';

export default function BrainSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Config State
    const [config, setConfig] = useState({
        id: '',
        clinicName: '',
        systemPrompt: '',
        knowledgeBase: '',
        isActive: true
    });

    // Fetch Config on Load
    useEffect(() => {
        fetch('/api/settings/brain')
            .then(res => res.json())
            .then(data => {
                if (data) setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                toast({ title: 'Cérebro Atualizado!', description: 'A IA agora vai usar essas novas regras.' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast({ title: 'Erro ao salvar', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Carregando cérebro digital...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Brain className="h-8 w-8 text-secondary" />
                        Configuração da IA
                    </h2>
                    <p className="text-gray-400">Ensine sua IA a vender como você.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-secondary text-black hover:bg-secondary/90">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left: Identity */}
                <Card className="border-border bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-white">Identidade</CardTitle>
                        <CardDescription>Como a IA deve se comportar?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Clínica (Interno)</Label>
                            <Input
                                value={config.clinicName}
                                onChange={e => setConfig({ ...config, clinicName: e.target.value })}
                                className="bg-background/50 border-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Prompt do Sistema (Personalidade)</Label>
                            <Textarea
                                value={config.systemPrompt}
                                onChange={e => setConfig({ ...config, systemPrompt: e.target.value })}
                                className="min-h-[300px] font-mono text-sm bg-black/50 border-input"
                                placeholder="Defina quem a IA é..."
                            />
                            <p className="text-xs text-gray-500">Dica: Defina o TOM DE VOZ e o OBJETIVO principal.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Knowledge Base */}
                <Card className="border-border bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            Base de Conhecimento (RAG)
                        </CardTitle>
                        <CardDescription>O que a IA sabe sobre seus produtos/preços?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Contexto de Vendas</Label>
                            <Textarea
                                value={config.knowledgeBase}
                                onChange={e => setConfig({ ...config, knowledgeBase: e.target.value })}
                                className="min-h-[400px] bg-black/50 border-input"
                                placeholder="Liste seus produtos, preços e regras..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
