'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, User, Phone, Globe, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { registerAction, ActionState } from './actions';

export function RegisterForm() {
  const [accountType, setAccountType] = React.useState<'BENEFICIARY' | 'MENTOR' | 'EXPERT'>('BENEFICIARY');
  const [showPassword, setShowPassword] = React.useState(false);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    { success: false }
  );

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Rejoignez la communauté ACCEENT
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Créez votre profil pour accélérer votre trajectoire professionnelle
        </CardDescription>

        {/* Sélection du rôle */}
        <div className="grid grid-cols-3 gap-2 pt-4">
          <button
            type="button"
            onClick={() => setAccountType('BENEFICIARY')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              accountType === 'BENEFICIARY'
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
          >
            Bénéficiaire
          </button>
          <button
            type="button"
            onClick={() => setAccountType('MENTOR')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              accountType === 'MENTOR'
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
          >
            Mentor
          </button>
          <button
            type="button"
            onClick={() => setAccountType('EXPERT')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              accountType === 'EXPERT'
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
          >
            Expert
          </button>
        </div>
      </CardHeader>

      <form action={formAction}>
        {/* Champ caché pour le type de compte */}
        <input type="hidden" name="accountType" value={accountType} />

        <CardContent className="space-y-4">
          {state.message && (
            <div
              className={`p-3 text-xs rounded-lg flex items-start gap-2 ${
                state.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {state.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span>{state.message}</span>
            </div>
          )}

          {state.success ? (
            <div className="text-center pt-2">
              <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                <Link href="/login">Aller à la page de connexion</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs">Prénom</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="ex. Fatou"
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                  {state.errors?.firstName && (
                    <p className="text-[11px] text-rose-600">{state.errors.firstName[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="ex. Diop"
                    className="text-xs"
                    required
                  />
                  {state.errors?.lastName && (
                    <p className="text-[11px] text-rose-600">{state.errors.lastName[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Adresse e-mail</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="fatou.diop@exemple.com"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-[11px] text-rose-600">{state.errors.email[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Téléphone</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+221 77 000 00 00"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs">Pays</Label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="country"
                      name="country"
                      defaultValue="Sénégal"
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informations sociodémographiques : Sexe, Milieu de résidence, Situation de handicap (SDH) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sexe" className="text-xs">Sexe / Genre</Label>
                  <select
                    id="sexe"
                    name="sexe"
                    defaultValue="FEMME"
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                    required
                  >
                    <option value="FEMME">Femme</option>
                    <option value="HOMME">Homme</option>
                  </select>
                  {state.errors?.sexe && (
                    <p className="text-[11px] text-rose-600">{state.errors.sexe[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="milieuDeResidence" className="text-xs">Milieu de résidence</Label>
                  <select
                    id="milieuDeResidence"
                    name="milieuDeResidence"
                    defaultValue="URBAIN"
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                    required
                  >
                    <option value="URBAIN">Urbain</option>
                    <option value="RURAL">Rural</option>
                  </select>
                  {state.errors?.milieuDeResidence && (
                    <p className="text-[11px] text-rose-600">{state.errors.milieuDeResidence[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sdh" className="text-xs">Situation de handicap (SDH)</Label>
                  <select
                    id="sdh"
                    name="sdh"
                    defaultValue="NON"
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                    required
                  >
                    <option value="NON">Non</option>
                    <option value="OUI">Oui</option>
                  </select>
                  {state.errors?.sdh && (
                    <p className="text-[11px] text-rose-600">{state.errors.sdh[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Mot de passe</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
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
                {state.errors?.password && (
                  <p className="text-[11px] text-rose-600">{state.errors.password[0]}</p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-foreground">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    className="mt-0.5 rounded border-border text-brand-primary focus:ring-brand-primary"
                    required
                  />
                  <span>
                    J'accepte sans réserve les{' '}
                    <Link href="/cgu" className="text-brand-primary underline" target="_blank">
                      Conditions Générales d'Utilisation
                    </Link>{' '}
                    d'ACCEENT (F01).
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-foreground">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    className="mt-0.5 rounded border-border text-brand-primary focus:ring-brand-primary"
                    required
                  />
                  <span>
                    Je consens au traitement de mes données personnelles conformément à la{' '}
                    <Link href="/confidentialite" className="text-brand-primary underline" target="_blank">
                      Politique de Confidentialité
                    </Link>{' '}
                    (RGPD / CDP).
                  </span>
                </label>
              </div>
            </>
          )}
        </CardContent>

        {!state.success && (
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold"
              disabled={isPending}
            >
              {isPending ? 'Création du compte...' : 'Créer mon compte'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Vous possédez déjà un compte ?{' '}
              <Link href="/login" className="text-brand-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
