'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Target,
  Briefcase,
  Compass,
  Clock,
  Layers,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { submitDiagnosticAction } from './actions';
import { CreateDiagnosticInput } from '@/lib/api/diagnostics';
import { UserProfileResponse } from '@/lib/api/users';
import { DiagnosticResultView } from './DiagnosticResultView';

interface DiagnosticWizardProps {
  userProfile?: UserProfileResponse | null;
}

const SITUATION_OPTIONS = [
  {
    label: 'Étudiant / Jeune diplômé',
    desc: 'À la recherche d’un stage ou d’un premier emploi pour démarrer votre carrière',
    value: 'Étudiant / Jeune diplômé à la recherche de stage ou premier emploi',
  },
  {
    label: 'Porteur de projet / Entrepreneur',
    desc: 'En phase d’idéation, de prototypage ou de développement d’entreprise',
    value: 'Porteur de projet ou entrepreneur en phase de lancement ou croissance',
  },
  {
    label: 'Professionnel en poste',
    desc: 'En transition, montée en compétences ou quête d’accélération de carrière',
    value: 'Professionnel en poste souhaitant accélérer son évolution ou se reconvertir',
  },
  {
    label: 'En recherche d’opportunités',
    desc: 'En recherche active d’emploi, de stage ou de formation qualifiante',
    value: 'En recherche active d’emploi ou d’opportunité professionnelle',
  },
];

const COMMON_OBJECTIVES = [
  'Décrocher un premier emploi ou un stage enrichissant',
  'Structurer mon modèle économique et préparer ma recherche de financements',
  'Monter en compétences techniques et maîtriser les outils modernes',
  'Développer mon réseau professionnel et rencontrer des experts du secteur',
  'Clarifier mon positionnement professionnel et booster ma confiance',
  'Préparer des entretiens de recrutement ou des pitchs investisseurs',
];

const COMMON_NEEDS = [
  'Optimisation de CV & préparation entretiens',
  'Conseils stratégiques sur mon business plan',
  'Validation d’architecture technique / revue de code',
  'Introduction à des partenaires & réseau d’affaires',
  'Développement du leadership et posture managériale',
  'Recherche de financements et subventions',
  'Stratégie commerciale et prospection clients',
];

const SECTORS_LIST = [
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

export function DiagnosticWizard({ userProfile }: DiagnosticWizardProps) {
  const router = useRouter();
  const profile = userProfile?.profile;

  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    diagnostic: any;
    recommendations: any[];
  } | null>(null);

  // Form states pré-remplis avec les données du profil existant si disponibles
  const [currentSituation, setCurrentSituation] = useState(
    profile?.currentTitle
      ? `${profile.currentTitle}${profile.organization ? ` chez ${profile.organization}` : ''}`
      : ''
  );
  const [experienceSummary, setExperienceSummary] = useState(profile?.bio || '');

  const [mainObjective, setMainObjective] = useState(
    profile?.objectives?.[0] || ''
  );
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    'Conseils stratégiques sur mon business plan',
    'Introduction à des partenaires & réseau d’affaires',
  ]);
  const [customNeedInput, setCustomNeedInput] = useState('');

  const [preferredMentoringType, setPreferredMentoringType] = useState<
    'INDIVIDUAL' | 'COLLECTIVE' | 'COACHING' | 'EXPERTISE' | 'ORIENTATION' | 'ENTREPRENEURSHIP' | 'DIGITAL_AI'
  >('INDIVIDUAL');

  const [sector, setSector] = useState(profile?.sector || 'Numérique, Tech & IA');
  const [domain, setDomain] = useState(profile?.currentTitle || 'Informatique & Technologies');
  const [level, setLevel] = useState('Intermédiaire');
  const [skills, setSkills] = useState<string[]>(profile?.skills || ['Développement Web', 'Gestion de projet']);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [availability, setAvailability] = useState('2 heures par semaine');
  const [preferredFormat, setPreferredFormat] = useState<'REMOTE' | 'IN_PERSON' | 'HYBRID'>('REMOTE');
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(['Français']);
  const [constraints, setConstraints] = useState<string[]>(['Disponible en soirée ou week-end']);
  const [newConstraintInput, setNewConstraintInput] = useState('');

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const addCustomNeed = () => {
    const trimmed = customNeedInput.trim();
    if (trimmed && !selectedNeeds.includes(trimmed)) {
      setSelectedNeeds((prev) => [...prev, trimmed]);
      setCustomNeedInput('');
    }
  };

  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills((prev) => prev.filter((item) => item !== s));
  };

  const addConstraint = () => {
    const trimmed = newConstraintInput.trim();
    if (trimmed && !constraints.includes(trimmed)) {
      setConstraints((prev) => [...prev, trimmed]);
      setNewConstraintInput('');
    }
  };

  const removeConstraint = (c: string) => {
    setConstraints((prev) => prev.filter((item) => item !== c));
  };

  const toggleLanguage = (lang: string) => {
    setPreferredLanguages((prev) =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter((l) => l !== lang) : prev) : [...prev, lang]
    );
  };

  // Validation par étape
  const canGoNext = () => {
    if (stepIndex === 0) return Boolean(currentSituation.trim());
    if (stepIndex === 1) return Boolean(mainObjective.trim()) && selectedNeeds.length > 0;
    if (stepIndex === 2) return Boolean(sector.trim()) && Boolean(domain.trim()) && skills.length > 0;
    if (stepIndex === 3) return Boolean(availability.trim());
    return true;
  };

  // Soumission finale du diagnostic vers l'API NestJS
  const handleSubmitDiagnostic = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateDiagnosticInput = {
      currentSituation: currentSituation.trim(),
      experienceSummary: experienceSummary.trim() || undefined,
      mainObjective: mainObjective.trim(),
      needs: selectedNeeds,
      preferredMentoringType,
      sector: sector.trim(),
      domain: domain.trim(),
      level,
      skills,
      availability,
      preferredFormat,
      preferredLanguages,
      constraints,
      rawQuestionnaire: {
        submittedAt: new Date().toISOString(),
        currentSituation,
        mainObjective,
        needs: selectedNeeds,
        preferredMentoringType,
        sector,
        domain,
        level,
        skills,
        availability,
        preferredFormat,
        preferredLanguages,
        constraints,
      },
    };

    try {
      const result = await submitDiagnosticAction(payload);
      if (!result.success) {
        setErrorMessage(result.message);
        setIsSubmitting(false);
        return;
      }

      // Si le diagnostic a réussi, on affiche le résultat et les recommandations
      const diagnosticData = result.data?.diagnostic || payload;
      const computedMatches = result.data?.matchingResults || [];
      setCompletedResult({
        diagnostic: diagnosticData,
        recommendations: computedMatches,
      });
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la soumission du diagnostic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedResult) {
    return (
      <DiagnosticResultView
        diagnostic={completedResult.diagnostic}
        recommendations={completedResult.recommendations}
        onRetake={() => {
          setCompletedResult(null);
          setStepIndex(0);
        }}
      />
    );
  }

  const STEPS_HEADERS = [
    { title: 'Situation actuelle', subtitle: 'Votre point de départ' },
    { title: 'Objectifs & Besoins', subtitle: 'Vos attentes du mentorat' },
    { title: 'Secteur & Compétences', subtitle: 'Votre domaine cible' },
    { title: 'Modalités & Disponibilités', subtitle: 'Votre organisation' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Barre d'étapes */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS_HEADERS.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                idx === stepIndex
                  ? 'bg-brand-primary'
                  : idx < stepIndex
                  ? 'bg-emerald-500'
                  : 'bg-muted'
              }`}
            />
            <p className="text-[11px] font-semibold truncate hidden sm:block text-foreground">
              {idx + 1}. {s.title}
            </p>
          </div>
        ))}
      </div>

      {errorMessage && (
        <Alert className="border-destructive/50 text-destructive bg-destructive/10">
          <AlertCircle className="w-4 h-4 text-destructive mr-2" />
          <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* ÉTAPE 1 : Situation actuelle */}
      {stepIndex === 0 && (
        <Card className="shadow-xs border-brand-primary/20">
          <CardHeader className="pb-3">
            <Badge variant="secondary" className="w-fit text-[10px] mb-1">
              Étape 1 sur 4
            </Badge>
            <CardTitle className="text-base font-bold">Votre situation professionnelle actuelle</CardTitle>
            <CardDescription className="text-xs">
              Cette information permet à votre mentor d'adapter son approche à votre réalité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Choisissez votre profil principal :</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SITUATION_OPTIONS.map((opt) => {
                  const isSelected = currentSituation === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setCurrentSituation(opt.value)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                          : 'border-border hover:border-brand-primary/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="situation-text" className="text-xs font-semibold">
                Ou décrivez précisément votre situation :
              </Label>
              <Input
                id="situation-text"
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                placeholder="Ex : Étudiante en Master 2 Gestion de projet à l'UCAD, passionnée par l'agribusiness"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="experienceSummary" className="text-xs font-semibold">
                Résumé succinct de votre parcours ou expérience (optionnel) :
              </Label>
              <Textarea
                id="experienceSummary"
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                rows={3}
                placeholder="Ex : 2 ans de stages dans le marketing digital, organisation d'ateliers étudiants, projet d'application mobile..."
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 2 : Objectifs & Besoins */}
      {stepIndex === 1 && (
        <Card className="shadow-xs border-brand-primary/20">
          <CardHeader className="pb-3">
            <Badge variant="secondary" className="w-fit text-[10px] mb-1">
              Étape 2 sur 4
            </Badge>
            <CardTitle className="text-base font-bold">Votre objectif prioritaire & vos besoins</CardTitle>
            <CardDescription className="text-xs">
              Quel résultat concret souhaitez-vous atteindre avec l'aide de votre mentor ?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Objectif principal :</Label>
              <Input
                value={mainObjective}
                onChange={(e) => setMainObjective(e.target.value)}
                placeholder="Ex : Décrocher mon premier emploi de développeur web junior"
                className="text-xs"
              />
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-muted-foreground block">
                  Exemples d'objectifs fréquents (cliquez pour sélectionner) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_OBJECTIVES.map((obj) => (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setMainObjective(obj)}
                      className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                        mainObjective === obj
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Besoins prioritaires */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Besoins prioritaires d'accompagnement :
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {selectedNeeds.length} sélectionné{selectedNeeds.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_NEEDS.map((need) => {
                  const isChecked = selectedNeeds.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleNeed(need)}
                      className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 text-xs ${
                        isChecked
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-medium'
                          : 'bg-card border-border hover:bg-muted/30 text-foreground'
                      }`}
                    >
                      <span>{need}</span>
                      {isChecked ? (
                        <Check className="w-4 h-4 shrink-0 text-brand-primary" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <Input
                  value={customNeedInput}
                  onChange={(e) => setCustomNeedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomNeed();
                    }
                  }}
                  placeholder="Ajouter un autre besoin personnalisé..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomNeed}
                  className="shrink-0 text-xs"
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Type d'accompagnement souhaité */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <Label className="text-xs font-semibold">Format d'accompagnement souhaité :</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Mentorat individuel', val: 'INDIVIDUAL', desc: '1 bénéficiaire pour 1 mentor' },
                  { label: 'Entrepreneuriat', val: 'ENTREPRENEURSHIP', desc: 'Accompagnement projet & startup' },
                  { label: 'Coaching ciblé', val: 'COACHING', desc: 'Conseils ponctuels sur un défi' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setPreferredMentoringType(item.val as any)}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      preferredMentoringType === item.val
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                        : 'bg-card border-border hover:bg-muted/30'
                    }`}
                  >
                    <div>{item.label}</div>
                    <span className="text-[10px] text-muted-foreground font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 3 : Secteur & Compétences */}
      {stepIndex === 2 && (
        <Card className="shadow-xs border-brand-primary/20">
          <CardHeader className="pb-3">
            <Badge variant="secondary" className="w-fit text-[10px] mb-1">
              Étape 3 sur 4
            </Badge>
            <CardTitle className="text-base font-bold">Secteur d'activité & Compétences ciblées</CardTitle>
            <CardDescription className="text-xs">
              Ces éléments sont au cœur du moteur de matching pour matcher avec l'expertise des mentors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Secteur */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Secteur d'activité principal :</Label>
              <Input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ex : Numérique, Tech & IA"
                className="text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SECTORS_LIST.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSector(sec)}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                      sector === sec
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Domaine d'expertise précis :</Label>
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Ex : Développement web & mobile"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Niveau d'avancement actuel :</Label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Débutant">Débutant (Découverte, premiers pas)</option>
                  <option value="Intermédiaire">Intermédiaire (Bases acquises, pratique en cours)</option>
                  <option value="Avancé">Avancé (Autonome, recherche de perfectionnement)</option>
                </select>
              </div>
            </div>

            {/* Compétences clés */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Compétences concernées :</Label>
                <span className="text-[11px] text-muted-foreground">{skills.length} ajoutée(s)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-muted/30 border border-border/50 min-h-10">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}>
                      <X className="w-3 h-3 hover:text-destructive" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Ajouter une compétence (ex: React, Pitch, Comptabilité)..."
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill} className="shrink-0 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 4 : Modalités, Disponibilités & Format */}
      {stepIndex === 3 && (
        <Card className="shadow-xs border-brand-primary/20">
          <CardHeader className="pb-3">
            <Badge variant="secondary" className="w-fit text-[10px] mb-1">
              Étape 4 sur 4
            </Badge>
            <CardTitle className="text-base font-bold">Disponibilités & Modalités d'échange</CardTitle>
            <CardDescription className="text-xs">
              Définissez votre rythme et les conditions idéales pour vos sessions avec le mentor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Disponibilité */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Temps consacré au mentorat :</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  '1 heure par semaine',
                  '2 heures par semaine',
                  '3 à 4 heures par semaine',
                  '1 session tous les 15 jours',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvailability(item)}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      availability === item
                        ? 'bg-brand-primary text-white border-brand-primary font-semibold'
                        : 'bg-card border-border hover:bg-muted/30'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Format privilégié */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-semibold">Format privilégié :</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Visioconférence (À distance)', val: 'REMOTE' },
                  { label: 'Présentiel', val: 'IN_PERSON' },
                  { label: 'Hybride (Les deux)', val: 'HYBRID' },
                ].map((fmt) => (
                  <button
                    key={fmt.val}
                    type="button"
                    onClick={() => setPreferredFormat(fmt.val as any)}
                    className={`p-2.5 rounded-lg border text-center text-xs ${
                      preferredFormat === fmt.val
                        ? 'bg-brand-primary text-white border-brand-primary font-semibold'
                        : 'bg-card border-border hover:bg-muted/30'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Langues */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-semibold">Langue(s) d'échange souhaitée(s) :</Label>
              <div className="flex flex-wrap gap-2">
                {['Français', 'Wolof', 'Anglais', 'Pulaar', 'Sérère'].map((lang) => {
                  const isSelected = preferredLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-primary text-white border-brand-primary font-semibold'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contraintes éventuelles */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-semibold">Contraintes particulières (optionnel) :</Label>
              <div className="flex flex-wrap gap-1.5">
                {constraints.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] border border-slate-200"
                  >
                    {c}
                    <button type="button" onClick={() => removeConstraint(c)}>
                      <X className="w-3 h-3 hover:text-destructive" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newConstraintInput}
                  onChange={(e) => setNewConstraintInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addConstraint();
                    }
                  }}
                  placeholder="Ex : Disponible uniquement les samedis matin..."
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addConstraint} className="shrink-0 text-xs">
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons de navigation */}
      <div className="flex items-center justify-between pt-2">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStepIndex((prev) => prev - 1)}
            disabled={isSubmitting}
            className="text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Précédent
          </Button>
        ) : (
          <div />
        )}

        {stepIndex < STEPS_HEADERS.length - 1 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setStepIndex((prev) => prev + 1)}
            disabled={!canGoNext()}
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs flex items-center gap-1.5"
          >
            Suivant
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleSubmitDiagnostic}
            disabled={isSubmitting || !canGoNext()}
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs flex items-center gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Calcul du matching en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Valider et trouver mes mentors
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
