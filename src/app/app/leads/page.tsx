'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lead } from '@/types';
import { format, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetch('/api/leads')
            .then((res) => res.json())
            .then((data) => {
                setLeads(data);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    const filteredLeads = filterStatus === 'ALL'
        ? leads
        : leads.filter(l => l.status === filterStatus);

    if (loading) return <div className="text-muted p-8">Loading leads...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">Leads</h2>
                    <p className="text-muted text-sm">Manage and track your incoming patients.</p>
                </div>
                <div className="flex gap-2">
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-[180px] bg-surface"
                    >
                        <option value="ALL">All Status</option>
                        <option value="NEW">New</option>
                        <option value="TRIAGING">Triaging</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="WON">Won</option>
                        <option value="LOST">Lost</option>
                    </Select>
                </div>
            </div>

            <Card className="overflow-hidden border-border bg-surface shadow-sm rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[rgba(255,255,255,0.03)] border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider">Name / Phone</th>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider">Score</th>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider">Intent</th>
                                <th className="px-6 py-4 font-semibold text-muted uppercase text-xs tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-surface">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                        No leads found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[rgba(255,255,255,0.04)] even:bg-[rgba(255,255,255,0.02)] transition-colors group">
                                        <td className="px-6 py-4 text-muted whitespace-nowrap">
                                            {isValid(new Date(lead.createdAt))
                                                ? format(new Date(lead.createdAt), 'dd MMM, HH:mm')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-text group-hover:text-primary transition-colors">{lead.name || 'Unknown'}</div>
                                            <div className="text-xs text-muted">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.triage?.lead_score === 'alto' && <Badge variant="gold">High</Badge>}
                                            {lead.triage?.lead_score === 'medio' && <Badge variant="warning">Medium</Badge>}
                                            {lead.triage?.lead_score === 'baixo' && <Badge variant="neutral">Low</Badge>}
                                            {!lead.triage?.lead_score && <span className="text-muted">-</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                lead.status === 'WON' ? 'success' :
                                                    lead.status === 'LOST' ? 'danger' :
                                                        lead.status === 'NEW' ? 'gold' :
                                                            'secondary'
                                            }>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-text/80">
                                            {lead.triage?.intent?.replace('_', ' ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/app/leads/${lead.id}`}
                                                className="font-medium text-primary hover:text-accent transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
