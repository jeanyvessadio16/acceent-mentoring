import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-surface py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <span className="text-3xl font-bold tracking-tight text-brand-primary">
            ACCEENT
          </span>
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

