import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { Logo } from '@/components/shared/Logo';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-surface py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo variant="full" size="lg" priority />
        </Link>
      </div>

      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

