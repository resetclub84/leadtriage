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
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                className="w-full bg-surface hover:bg-surface-2 border-border text-text flex items-center gap-2"
                                onClick={() => signIn('google')}
                                type="button"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M24 12.276C24 11.42 23.92 10.6 23.776 9.8H12V14.6H18.72C18.432 16.148 17.568 17.476 16.276 18.36V21.48H20.308C22.668 19.308 24 16.108 24 12.276Z" />
                                    <path fill="#34A853" d="M12 24C15.24 24 17.964 22.924 19.952 21.084L15.92 17.964C14.848 18.68 13.48 19.12 12 19.12C8.88 19.12 6.24 17.02 5.292 14.18H1.216V17.34C3.212 21.304 7.308 24 12 24Z" />
                                    <path fill="#FBBC05" d="M5.292 14.18C5.052 13.456 4.92 12.74 4.92 12C4.92 11.26 4.788 10.544 5.292 9.82V6.66H1.216C0.44 8.212 0 9.964 0 12C0 14.036 0.44 15.788 1.216 17.34L5.292 14.18Z" />
                                    <path fill="#4285F4" d="M12 4.88C13.764 4.88 15.348 5.488 16.592 6.676L20.048 3.22C17.96 1.272 15.236 0 12 0C7.308 0 3.212 2.696 1.216 6.66L5.292 9.82C6.24 6.98 8.88 4.88 12 4.88Z" />
                                </svg>
                                Continue with Google
                            </Button>
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-muted">Or continue with</span></div>
                            </div>
                        </div>

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
