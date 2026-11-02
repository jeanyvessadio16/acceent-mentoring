'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPasswordAction, ActionState } from '@/features/auth/actions';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    { success: false }
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-surface">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <span className="text-3xl font-bold tracking-tight text-brand-primary">
            ACCEENT
          </span>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Mot de passe oublié
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Saisissez votre e-mail pour recevoir les instructions de réinitialisation via Supabase Auth (F01).
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
              <Link href="/login">Retour à la connexion</Link>
            </Button>
          </CardContent>
        ) : (
          <form action={formAction}>
            <CardContent className="space-y-4">
              {state.message && !state.success && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{state.message}</span>
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
                    className="pl-9 text-xs"
                    required
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-[11px] text-rose-600">{state.errors.email[0]}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold"
              >
                {isPending ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
              <Button variant="ghost" asChild className="text-xs text-muted-foreground">
                <Link href="/login" className="flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour à la connexion
                </Link>
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
