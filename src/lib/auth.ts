import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Import prisma instance
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (user && user.password === credentials.password) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth error:", e);
                    return null;
                } finally {
                    await prisma.$disconnect();
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            // Logic for Google Sign In
            if (account?.provider === 'google') {
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();

                // Check if user exists with this email
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (existingUser) {
                    // Start Update existing user with Google info if needed (optional)
                    // For now, we just allow login if email matches a known user
                    // OR you could allow creating new users here if open registration is desired (e.g., allowlist check)

                    // Allow login
                    user.role = existingUser.role;
                    user.id = existingUser.id;
                    return true;
                } else {
                    // Check Allowlist if desired, or auto-create Staff
                    // For MVP strictness: Only allow if email already exists in DB (Seed Admin)
                    console.log('❌ Denied Google Login for non-existing user:', user.email);
                    return false;
                }
            }
            return true; // Credentials flow
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
}
