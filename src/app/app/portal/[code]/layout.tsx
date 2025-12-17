'use client';

import { use, useEffect, useState } from 'react';
import PortalBottomNav from '@/components/portal/PortalBottomNav';
import PortalChat from '@/components/portal/PortalChat';
import MedicalDisclaimer from '@/components/legal/MedicalDisclaimer';
import { useRouter } from 'next/navigation';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ code: string }>;
}

export default function MobileAppLayout({ children, params }: LayoutProps) {
    const { code } = use(params);
    const router = useRouter();
    const [isValidated, setIsValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    // Validate access code against database
    useEffect(() => {
        if (!code) {
            router.push('/app/portal');
            return;
        }

        // Check if disclaimer was already accepted this session
        const accepted = sessionStorage.getItem('medical_disclaimer_accepted');
        if (!accepted) {
            setShowDisclaimer(true);
        }

        // Validate code against database
        const validateCode = async () => {
            try {
                const res = await fetch('/api/portal/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });

                if (res.ok) {
                    setIsValidated(true);
                } else {
                    // Invalid code - redirect to login
                    router.push('/app/portal');
                }
            } catch (error) {
                console.error('Validation error:', error);
                router.push('/app/portal');
            } finally {
                setIsLoading(false);
            }
        };

        validateCode();
    }, [code, router]);

    // Show loading state while validating
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    // Don't render if not validated
    if (!isValidated) {
        return null;
    }

    return (
        <>
            {showDisclaimer && <MedicalDisclaimer onAccept={() => setShowDisclaimer(false)} />}
            <div className="flex flex-col min-h-screen bg-black pb-20">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
                <PortalChat code={code} />
                <PortalBottomNav code={code} />
            </div>
        </>
    );
}
