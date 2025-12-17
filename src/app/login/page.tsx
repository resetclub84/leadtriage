'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/app/leads');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError('Invalid credentials');
            setIsLoading(false);
        } else {
            router.push('/app/leads');
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-text">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-primary">LeadTriage</h1>
                    <p className="text-muted text-sm">Sign in to manage your clinic's pipeline.</p>
                </div>

                <Card className="border-border shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="admin@leadtriage.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && (
                                <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-xs text-muted">Protected System • Authorized Personnel Only</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
