export type Lead = {
    id: string;
    createdAt: string;
    source: string;
    name?: string;
    phone?: string;
    email?: string;
    message: string;
    status: string; // NEW, TRIAGING, CONTACTED, SCHEDULED, WON, LOST
    tags: string[];
    notes?: string;
    triage?: TriageResult;
    events?: EventLog[];
};

export type TriageResult = {
    id: string;
    resposta_ao_usuario: string;
    intent: string;
    lead_score: string;
    interesse_principal: string;
    nivel_urgencia: string;
    provavel_plano: string;
    indicacao_programa: string;
    precisa_humano: boolean;
    possivel_ticket?: string;
    probabilidade_fechamento?: string;
    observacoes?: string;
};

export type EventLog = {
    id: string;
    createdAt: string;
    type: string;
    payload: any;
};
