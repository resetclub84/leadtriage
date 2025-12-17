export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-black min-h-screen">
            {children}
        </div>
    );
}
