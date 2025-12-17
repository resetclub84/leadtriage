'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-2xl font-serif font-bold text-primary">Settings</h2>
                <p className="text-muted text-sm">Configure your application integrations.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>AI Configuration</CardTitle>
                            <CardDescription>Status of your Gemini AI connection.</CardDescription>
                        </div>
                        <Badge variant="success" className="gap-1 pl-1 pr-2">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted">
                        Your Gemini API Key is configured in the environment variables. The triage engine is active and processing leads.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>External services connected to LeadTriage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">Google Form URL</label>
                        <Input
                            readOnly
                            value={process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || ''}
                            className="bg-[rgba(255,255,255,0.03)] text-muted border-dashed"
                        />
                        <p className="text-xs text-muted">Read-only (Managed in .env)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">WhatsApp Base URL</label>
                        <Input
                            readOnly
                            value={process.env.NEXT_PUBLIC_WHATSAPP_BASE || 'https://wa.me/'}
                            className="bg-[rgba(255,255,255,0.03)] text-muted border-dashed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">N8N Webhook</label>
                        <Input
                            readOnly
                            value={'Managed in .env'}
                            type="password"
                            className="bg-[rgba(255,255,255,0.03)] text-muted border-dashed"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
