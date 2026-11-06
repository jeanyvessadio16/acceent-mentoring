'use client';

import React, { useActionState, useState } from 'react';
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
  Target,
  Plus,
  X,
  Compass,
  Check,
} from 'lucide-react';

interface ProfileFormProps {
  user: UserProfileResponse;
}

const initialState: ProfileActionResult = {
  success: false,
  message: '',
};

const SUGGESTED_SECTORS = [
  'Numérique, Tech & IA',
  'Agrobusiness & Agroalimentaire',
  'Entrepreneuriat & Création d\'entreprise',
  'Finance, Banque & Fintech',
  'Santé, Médical & Pharmacie',
  'Énergie, Environnement & Climat',
  'Commerce, Vente & Distribution',
  'Éducation & Formation',
  'Artisanat, Mode & Métiers d\'Art',
  'Communication, Médias & Design',
];

const SUGGESTED_SKILLS = [
  'Développement Web',
  'Marketing Digital',
  'Gestion de Projet',
  'Business Plan',
  'Analyse de Données',
  'Comptabilité & Finance',
  'Communication & Pitch',
  'Vente & Négociation',
  'Design Graphique / UI',
  'Leadership',
];

const SUGGESTED_OBJECTIVES = [
  'Trouver un mentor pour accélérer mon projet',
  'Décrocher un premier emploi ou stage',
  'Monter en compétences techniques',
  'Préparer un pitch investisseur',
  'Développer mon réseau professionnel',
  'Clarifier mon orientation de carrière',
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  const profile = user.profile;

  // États locaux interactifs pour les listes et le secteur
  const [sector, setSector] = useState(profile?.sector || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [objectives, setObjectives] = useState<string[]>(profile?.objectives || []);
  const [newObjectiveInput, setNewObjectiveInput] = useState('');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Ajout / Suppression de compétences
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Ajout / Suppression d'objectifs
  const addObjective = (obj: string) => {
    const trimmed = obj.trim();
    if (trimmed && !objectives.includes(trimmed)) {
      setObjectives((prev) => [...prev, trimmed]);
      setNewObjectiveInput('');
    }
  };

  const removeObjective = (objToRemove: string) => {
    setObjectives((prev) => prev.filter((o) => o !== objToRemove));
  };

  // Ajout / Suppression de centres d'intérêt
  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setNewInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests((prev) => prev.filter((i) => i !== interestToRemove));
  };

  // Calcul du taux de complétion
  const hasSector = Boolean(sector.trim());
  const hasSkills = skills.length > 0;
  const hasObjectives = objectives.length > 0;
  const hasIdentity = Boolean(profile?.firstName && profile?.lastName);
  const hasContact = Boolean(profile?.phone || user.phone);
  const hasEducation = Boolean(profile?.educationLevel || profile?.currentTitle);
  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 10);

  // Le critère strict du backend pour isCompleted
  const isBackendComplete = hasSector && hasSkills && hasObjectives;

  // Calcul du score global sur 100%
  const completionItems = [
    { label: "Secteur d'activité (Requis)", complete: hasSector, weight: 20 },
    { label: 'Compétences ciblées (Requis)', complete: hasSkills, weight: 20 },
    { label: 'Objectifs de mentorat (Requis)', complete: hasObjectives, weight: 20 },
    { label: 'Nom & Prénom', complete: hasIdentity, weight: 10 },
    { label: 'Téléphone de contact', complete: hasContact, weight: 10 },
    { label: 'Niveau ou Titre actuel', complete: hasEducation, weight: 10 },
    { label: 'Biographie de présentation', complete: hasBio, weight: 10 },
  ];

  const completionPercentage = completionItems.reduce(
    (acc, item) => acc + (item.complete ? item.weight : 0),
    0
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Champs sérialisés transmis au Server Action */}
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="skills" value={JSON.stringify(skills)} />
      <input type="hidden" name="objectives" value={JSON.stringify(objectives)} />
      <input type="hidden" name="interests" value={JSON.stringify(interests)} />

      {/* Message de notification d'action */}
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

      {/* Bannière d'état de complétion du profil */}
      <Card
        className={`shadow-xs border ${
          isBackendComplete
            ? 'border-emerald-300 bg-linear-to-r from-emerald-50/60 via-teal-50/30 to-transparent'
            : 'border-amber-300 bg-linear-to-r from-amber-50/80 via-orange-50/40 to-transparent'
        }`}
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isBackendComplete
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isBackendComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Target className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {isBackendComplete
                      ? 'Profil complet & actif pour le matching'
                      : 'Complétez votre profil bénéficiaire'}
                  </h3>
                  <Badge
                    className={`text-[10px] ${
                      isBackendComplete
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {completionPercentage}% complété
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBackendComplete
                    ? 'Toutes les informations nécessaires au jumelage avec un mentor sont renseignées.'
                    : 'Remplissez le secteur, vos compétences et vos objectifs pour permettre aux mentors de vous accompagner.'}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="bg-brand-primary hover:bg-brand-secondary text-white text-xs shrink-0"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>

          {/* Barre de progression */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isBackendComplete ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Checklist des éléments requis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/50 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  hasSector ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 font-bold'
                }`}
              >
                {hasSector ? '✓' : '!'}
              </span>
              <span className={hasSector ? 'text-foreground' : 'text-amber-800 font-medium'}>
                Secteur d'activité
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  hasSkills ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 font-bold'
                }`}
              >
                {hasSkills ? '✓' : '!'}
              </span>
              <span className={hasSkills ? 'text-foreground' : 'text-amber-800 font-medium'}>
                Compétences ({skills.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  hasObjectives ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 font-bold'
                }`}
              >
                {hasObjectives ? '✓' : '!'}
              </span>
              <span className={hasObjectives ? 'text-foreground' : 'text-amber-800 font-medium'}>
                Objectifs ({objectives.length})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Profil Bénéficiaire'}
                </h3>
                <Badge className="bg-brand-primary text-white text-[10px]">
                  {user.role}
                </Badge>
                {isBackendComplete ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                    Profil complet
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                    Profil incomplet
                  </Badge>
                )}
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

      {/* SECTION 1: Matching & Orientation (Secteur, Compétences, Objectifs) */}
      <Card className="shadow-xs border-brand-primary/30">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-primary" />
              Secteur, Compétences & Objectifs de mentorat
            </span>
            <Badge variant="secondary" className="text-[10px] bg-brand-primary/10 text-brand-primary">
              Priorité Matching
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Ces critères sont indispensables pour activer l'algorithme de recommandation et trouver le mentor qui correspond à vos projets.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-4 text-xs">
          {/* Secteur d'activité */}
          <div className="space-y-2">
            <Label htmlFor="sector-input" className="text-xs font-semibold flex items-center gap-1">
              Secteur d'activité principal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sector-input"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ex : Numérique, Tech & IA, Agrobusiness..."
              className="text-xs"
              required
            />
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Suggestions rapides (cliquez pour sélectionner) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SECTORS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSector(sec)}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      sector === sec
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1">
                Compétences recherchées ou détenues <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {skills.length} compétence{skills.length > 1 ? 's' : ''} ajoutée{skills.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Tags déjà ajoutés */}
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/60 min-h-10">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive transition-colors"
                      title="Retirer cette compétence"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                Ajoutez au moins une compétence pour permettre le jumelage avec un mentor.
              </p>
            )}

            {/* Saisie d'une nouvelle compétence */}
            <div className="flex gap-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(newSkillInput);
                  }
                }}
                placeholder="Ajouter une compétence personnalisée (ex: Analyse financière)..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSkill(newSkillInput)}
                className="shrink-0 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            </div>

            {/* Suggestions rapides de compétences */}
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Suggestions courantes :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.map((item) => {
                  const isSelected = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => (isSelected ? removeSkill(item) : addSkill(item))}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Objectifs de mentorat */}
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1">
                Vos objectifs prioritaires pour le mentorat <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {objectives.length} objectif{objectives.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Liste des objectifs ajoutés */}
            {objectives.length > 0 ? (
              <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/60">
                {objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-background border border-border text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>{obj}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeObjective(obj)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                      title="Retirer cet objectif"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                Définissez au moins un objectif pour que votre mentor comprenne vos attentes.
              </p>
            )}

            {/* Saisie d'un objectif */}
            <div className="flex gap-2">
              <Input
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addObjective(newObjectiveInput);
                  }
                }}
                placeholder="Ajouter un objectif personnalisé (ex: Structurer ma première levée de fonds)..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addObjective(newObjectiveInput)}
                className="shrink-0 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            </div>

            {/* Suggestions rapides d'objectifs */}
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Objectifs types (cliquez pour ajouter) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_OBJECTIVES.map((item) => {
                  const isSelected = objectives.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => (isSelected ? removeObjective(item) : addObjective(item))}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Centres d'intérêt */}
          <div className="space-y-2 pt-3 border-t border-border/50">
            <Label className="text-xs font-semibold">Centres d'intérêt & passions (optionnel)</Label>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] border border-slate-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeInterest(item)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInterest(newInterestInput);
                  }
                }}
                placeholder="Ex : Intelligence Artificielle, Agritech, Inclusion..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addInterest(newInterestInput)}
                className="shrink-0 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Informations Générales & Critères d'inclusion */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-brand-primary" />
            Informations Générales & Inclusion
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

      {/* SECTION 3: Profil professionnel & académique */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-primary" />
            Parcours & Expérience
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label htmlFor="yearsOfExperience" className="text-xs">
                Années d'expérience professionnelle
              </Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                defaultValue={profile?.yearsOfExperience ?? ''}
                placeholder="Ex : 1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs">
              Biographie & Présentation
            </Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ''}
              placeholder="Présentez brièvement votre parcours, vos ambitions et ce que vous attendez de votre mentor..."
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-3 border-t border-border">
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isPending ? 'Enregistrement en cours...' : 'Enregistrer mon profil'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
