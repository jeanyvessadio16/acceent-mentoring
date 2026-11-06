'use client';

import React, { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { resetPasswordAction, ActionState } from '@/features/auth/actions';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    // 1. Recherche dans les paramètres d'URL standards (?token=... ou ?access_token=...)
    const tokenFromParams = searchParams.get('token') || searchParams.get('access_token');
    if (tokenFromParams) {
      setToken(tokenFromParams);
      return;
    }

    // 2. Recherche dans le hash fragment Supabase (#access_token=...&type=recovery)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const hashToken = params.get('access_token') || params.get('token');
      if (hashToken) {
        setToken(hashToken);
      }
    }
  }, [searchParams]);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    { success: false }
  );

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Choisissez un mot de passe robuste d'au moins 8 caractères.
        </CardDescription>
      </CardHeader>

      {state.success ? (
        <CardContent className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {state.message}
          </p>
          <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs mt-4">
            <Link href="/login">Se connecter avec le nouveau mot de passe</Link>
          </Button>
        </CardContent>
      ) : !token ? (
        <CardContent className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm text-foreground">
            Lien de réinitialisation requis
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pour sécuriser votre compte, vous devez cliquer sur le lien envoyé à votre adresse email pour accéder à cette page.
          </p>
          <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs mt-2">
            <Link href="/forgot-password" className="flex items-center justify-center gap-1.5">
              Demander un lien de réinitialisation
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardContent>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="accessToken" value={token} />

          <CardContent className="space-y-4">
            {state.message && !state.success && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{state.message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  className="pl-9 pr-10 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {state.errors?.newPassword && (
                <p className="text-[11px] text-rose-600 font-medium">{state.errors.newPassword[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold"
            >
              {isPending ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
            </Button>
            <Button variant="ghost" asChild className="text-xs text-muted-foreground">
              <Link href="/login">Annuler et revenir à la connexion</Link>
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-surface">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo variant="full" size="lg" priority />
        </Link>
      </div>

      <Suspense fallback={<div className="text-xs text-muted-foreground">Chargement...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
