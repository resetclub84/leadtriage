'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function OnboardingPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const res = await fetch(`/api/patients/${id}`);
            const data = await res.json();
            setPatient(data);

            // If already completed onboarding, redirect to journey
            if (data.onboardingCompleted) {
                router.push(`/app/patients/${id}/journey`);
            }
        } catch (error) {
            console.error('Erro ao buscar paciente:', error);
        }
        setLoading(false);
    };

    const handleComplete = () => {
        // Redirect to journey after onboarding
        router.push(`/app/patients/${id}/journey`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Paciente não encontrado</div>
            </div>
        );
    }

    return (
        <OnboardingWizard
            patientId={id}
            patientName={patient.name}
            onComplete={handleComplete}
        />
    );
}
