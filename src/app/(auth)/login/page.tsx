import React, { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/LoginForm';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-surface">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo variant="full" size="lg" priority />
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-xs text-muted-foreground p-8">Chargement de la connexion...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
