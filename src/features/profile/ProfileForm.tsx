'use client';

import React, { useActionState } from 'react';
import { UserProfileResponse } from '@/lib/api/users';
import { updateProfileAction, ProfileActionResult } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Building,
} from 'lucide-react';

interface ProfileFormProps {
  user: UserProfileResponse;
}

const initialState: ProfileActionResult = {
  success: false,
  message: '',
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  const profile = user.profile;

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <Alert
          className={
            state.success
              ? 'border-emerald-500/50 text-emerald-800 bg-emerald-50'
              : 'border-destructive/50 text-destructive bg-destructive/10'
          }
        >
          {state.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive mr-2" />
          )}
          <AlertDescription className="text-xs font-medium">{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Carte d'identité du compte */}
      <Card className="shadow-xs border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-transparent to-transparent">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
              {(profile?.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Profil Utilisateur'}
                </h3>
                <Badge className="bg-brand-primary text-white text-[10px]">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:text-right">
            {profile?.sexe && (
              <Badge variant="outline" className="text-[10px]">
                Sexe : {profile.sexe === 'FEMME' ? 'Femme' : 'Homme'}
              </Badge>
            )}
            {profile?.milieuDeResidence && (
              <Badge variant="outline" className="text-[10px]">
                Milieu : {profile.milieuDeResidence === 'RURAL' ? 'Rural' : 'Urbain'}
              </Badge>
            )}
            {profile?.sdh && (
              <Badge variant="outline" className="text-[10px]">
                SDH : {profile.sdh === 'OUI' ? 'Oui' : 'Non'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-brand-primary" />
            Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile?.firstName || ''}
                required
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile?.lastName || ''}
                required
                placeholder="Votre nom de famille"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-[10px] text-muted-foreground">L'e-mail de connexion est non modifiable.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone || profile?.phone || ''}
                placeholder="+221 77 000 00 00"
              />
            </div>
          </div>

          {/* Critères inclusion : Sexe, Milieu de résidence, SDH */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-1.5">
              <Label htmlFor="sexe" className="text-xs">
                Sexe
              </Label>
              <select
                id="sexe"
                name="sexe"
                defaultValue={profile?.sexe || ''}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionner</option>
                <option value="FEMME">Femme</option>
                <option value="HOMME">Homme</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="milieuDeResidence" className="text-xs">
                Milieu de résidence
              </Label>
              <select
                id="milieuDeResidence"
                name="milieuDeResidence"
                defaultValue={profile?.milieuDeResidence || ''}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionner</option>
                <option value="URBAIN">Urbain</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sdh" className="text-xs">
                Situation De Handicap (SDH)
              </Label>
              <select
                id="sdh"
                name="sdh"
                defaultValue={profile?.sdh || 'NON'}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="NON">Non</option>
                <option value="OUI">Oui</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs">
                Pays
              </Label>
              <Input
                id="country"
                name="country"
                defaultValue={profile?.country || 'Sénégal'}
                placeholder="Ex : Sénégal"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs">
                Ville
              </Label>
              <Input
                id="city"
                name="city"
                defaultValue={profile?.city || ''}
                placeholder="Ex : Dakar, Thiès, Saint-Louis..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil professionnel & académique */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-primary" />
            Parcours & Compétences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="educationLevel" className="text-xs">
                Niveau d'études / Diplôme
              </Label>
              <Input
                id="educationLevel"
                name="educationLevel"
                defaultValue={profile?.educationLevel || ''}
                placeholder="Ex : Licence 3 Informatique, Bac+2..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentTitle" className="text-xs">
                Titre actuel / Statut
              </Label>
              <Input
                id="currentTitle"
                name="currentTitle"
                defaultValue={profile?.currentTitle || ''}
                placeholder="Ex : Développeur junior, Étudiant, Porteur de projet"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organization" className="text-xs">
              Organisation, Entreprise ou Université
            </Label>
            <Input
              id="organization"
              name="organization"
              defaultValue={profile?.organization || ''}
              placeholder="Ex : Université Cheikh Anta Diop, KeurTech..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs">
              Biographie & Objectifs
            </Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ''}
              placeholder="Présentez brièvement votre parcours, vos ambitions et ce que vous recherchez dans ce mentorat..."
            />
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div className="pt-2">
              <Label className="text-xs mb-2 block">Compétences d'intérêt</Label>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end pt-3 border-t border-border">
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isPending ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

