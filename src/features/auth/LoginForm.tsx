'use client';

import React, { useActionState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { loginAction, resendConfirmationAction, ActionState } from './actions';

export function LoginForm() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const sessionExpired = searchParams.get('sessionExpired') === 'true';

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction,
    { success: false }
  );

  const [emailValue, setEmailValue] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isResending, startResendTransition] = useTransition();

  const handleResend = () => {
    if (!emailValue) return;
    startResendTransition(async () => {
      const res = await resendConfirmationAction(emailValue);
      setResendStatus(res.message || 'Email de confirmation envoyé.');
    });
  };

  const isEmailUnconfirmed =
    state.message?.toLowerCase().includes('confirm') ||
    state.message?.toLowerCase().includes('vérifi');

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Connexion à ACCEENT
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Accédez à votre espace d'accompagnement et de progression
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get('redirect') || searchParams.get('callbackUrl') || ''}
        />
        <CardContent className="space-y-4">
          {sessionExpired && (
            <div className="p-3 text-xs rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>Votre session a expiré ou vos accès doivent être renouvelés. Veuillez vous reconnecter pour accéder à votre espace.</span>
            </div>
          )}

          {confirmed && (
            <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Votre adresse email a été confirmée avec succès ! Vous pouvez maintenant vous connecter.</span>
            </div>
          )}

          {state.message && !state.success && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-1">
                  <p className="font-medium">{state.message}</p>
                  {state.message.includes('Identifiants invalides') && (
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Si votre adresse e-mail a déjà été confirmée, votre mot de passe ou votre adresse e-mail est incorrect. Vous pouvez réinitialiser votre mot de passe via le lien ci-dessous.
                    </p>
                  )}
                </div>
              </div>
              {isEmailUnconfirmed && (
                <div className="pt-2 border-t border-rose-200/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleResend}
                    disabled={isResending || !emailValue}
                    className="text-xs w-full bg-white text-rose-800 border-rose-300 hover:bg-rose-100"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Envoi en cours...' : 'Renvoyer le lien de confirmation'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {resendStatus && (
            <div className="p-3 text-xs rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {resendStatus}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nom@exemple.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="pl-9 text-xs"
                required
              />
            </div>
            {state.errors?.email && (
              <p className="text-[11px] text-rose-600 font-medium">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs">Mot de passe</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-primary hover:underline font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
            {state.errors?.password && (
              <p className="text-[11px] text-rose-600 font-medium">{state.errors.password[0]}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold"
            disabled={isPending}
          >
            {isPending ? 'Connexion en cours...' : 'Se connecter'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Vous n'avez pas encore de compte ?{' '}
            <Link href="/register" className="text-brand-primary font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
