export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-black min-h-screen text-white font-sans antialiased">
            <main className="max-w-md mx-auto min-h-screen bg-zinc-950 relative shadow-2xl overflow-hidden">
                {/* Mobile Mockup Style Wrapper */}
                {children}
            </main>
        </div>
    );
}
