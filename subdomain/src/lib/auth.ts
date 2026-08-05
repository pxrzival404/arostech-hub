import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// M17: In-memory rate limiter for login attempts
// Key: email (lowercase), Value: { attempts, lockedUntil }
const loginAttempts = new Map<string, { attempts: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit lockout

function checkLoginRateLimit(email: string): { allowed: boolean; remainingMs?: number } {
  const record = loginAttempts.get(email);
  const now = Date.now();

  if (!record) {
    return { allowed: true };
  }

  // Jika masih dalam periode lockout
  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remainingMs: record.lockedUntil - now };
  }

  // Jika periode lockout sudah lewat, reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(email: string): void {
  const record = loginAttempts.get(email) || { attempts: 0, lockedUntil: 0 };
  record.attempts++;

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCK_DURATION_MS;
  }

  loginAttempts.set(email, record);
}

function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

export const authOptions: NextAuthOptions = {
  // Allow NextAuth to work on any domain (needed for preview URLs and Vercel deployment)
  // Without this, NextAuth rejects requests from domains that don't match NEXTAUTH_URL
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const emailLower = credentials.email.toLowerCase();

        // M17: Check login rate limit
        const rateCheck = checkLoginRateLimit(emailLower);
        if (!rateCheck.allowed) {
          const remainingMin = Math.ceil((rateCheck.remainingMs || 0) / 60000);
          throw new Error(`Terlalu banyak percobaan login. Coba lagi dalam ${remainingMin} menit.`);
        }

        const user = await db.user.findUnique({
          where: { email: emailLower },
        });

        if (!user || !user.password) {
          recordFailedAttempt(emailLower);
          throw new Error("Email atau password salah");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          recordFailedAttempt(emailLower);
          throw new Error("Email atau password salah");
        }

        // M17: Reset rate limit on successful login
        resetLoginAttempts(emailLower);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    // Note: NextAuth's PagesOptions tidak punya field `register`.
    // Halaman register di-handle manual di /auth/register (page.tsx),
    // di-link dari login page. Tidak perlu di-daftarkan di sini.
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
