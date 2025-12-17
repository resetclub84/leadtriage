'use client';

import { useState, ReactNode } from 'react';
import PaywallModal from './PaywallModal';

interface PremiumGateProps {
    children: ReactNode;
    isPro: boolean;
    featureName?: string;
}

/**
 * Wrapper component that gates premium features.
 * If user is not PRO, clicking will show PaywallModal instead of rendering children functionality.
 * 
 * Usage:
 * <PremiumGate isPro={patient.subscriptionPlan === 'PRO'} featureName="Coach IA">
 *     <PortalChat code={code} />
 * </PremiumGate>
 */
export default function PremiumGate({ children, isPro, featureName = 'Este recurso' }: PremiumGateProps) {
    const [showPaywall, setShowPaywall] = useState(false);

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <>
            <div onClick={() => setShowPaywall(true)} className="cursor-pointer">
                {children}
            </div>
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                featureName={featureName}
            />
        </>
    );
}
