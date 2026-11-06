'use client';

import React, { useState, useTransition } from 'react';
import { MatchingWeights, MentoringProgramItem } from '@/lib/api/admin';
import { updateMatchingWeightsAction, createMentoringProgramAction } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  Sliders,
  Sparkles,
  Layers,
  Plus,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  Check,
} from 'lucide-react';

interface AdminSettingsClientProps {
  initialWeights: MatchingWeights;
  initialPrograms: MentoringProgramItem[];
}

export function AdminSettingsClient({
  initialWeights,
  initialPrograms,
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'WEIGHTS' | 'PROGRAMS'>('WEIGHTS');

  // État des poids
  const [weights, setWeights] = useState<MatchingWeights>(initialWeights);
  const [isPendingWeights, startWeightsTransition] = useTransition();
  const [weightsFeedback, setWeightsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Somme des poids
  const currentTotal =
    (weights.expertiseWeight || 0) +
    (weights.objectiveWeight || 0) +
    (weights.sectorWeight || 0) +
    (weights.availabilityWeight || 0) +
    (weights.languageWeight || 0) +
    (weights.formatWeight || 0);

  const isValidTotal = currentTotal === 100;

  const handleWeightChange = (key: keyof MatchingWeights, value: number) => {
    const cleanVal = isNaN(value) ? 0 : Math.max(0, Math.min(100, Math.round(value)));
    setWeights((prev) => ({ ...prev, [key]: cleanVal }));
  };

  const handleSaveWeights = () => {
    if (!isValidTotal) return;
    startWeightsTransition(async () => {
      setWeightsFeedback(null);
      const res = await updateMatchingWeightsAction(weights);
      if (res.success) {
        setWeightsFeedback({ type: 'success', message: res.message });
      } else {
        setWeightsFeedback({ type: 'error', message: res.message });
      }
    });
  };

  // État des programmes
  const [programs, setPrograms] = useState<MentoringProgramItem[]>(initialPrograms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPendingProgram, startProgramTransition] = useTransition();
  const [programFeedback, setProgramFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    targetAudience: 'Jeunes diplômés, porteurs de projets et entrepreneurs',
    territory: 'Sénégal',
    targetBeneficiaries: 100,
    startDate: '',
    endDate: '',
  });

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    startProgramTransition(async () => {
      setProgramFeedback(null);
      const res = await createMentoringProgramAction({
        ...newProgram,
        startDate: newProgram.startDate ? new Date(newProgram.startDate).toISOString() : undefined,
        endDate: newProgram.endDate ? new Date(newProgram.endDate).toISOString() : undefined,
      });

      if (res.success && res.data) {
        setPrograms((prev) => [res.data, ...prev]);
        setProgramFeedback({ type: 'success', message: res.message });
        setIsModalOpen(false);
        setNewProgram({
          title: '',
          description: '',
          targetAudience: 'Jeunes diplômés, porteurs de projets et entrepreneurs',
          territory: 'Sénégal',
          targetBeneficiaries: 100,
          startDate: '',
          endDate: '',
        });
      } else {
        setProgramFeedback({ type: 'error', message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation onglets */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab('WEIGHTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'WEIGHTS'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Pondérations de Matching (F05)
        </button>

        <button
          onClick={() => setActiveTab('PROGRAMS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'PROGRAMS'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Programmes de Mentoring ({programs.length})
        </button>
      </div>

      {/* ONGLET 1: POIDS DE MATCHING */}
      {activeTab === 'WEIGHTS' && (
        <div className="space-y-6">
          {weightsFeedback && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 ${
                weightsFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {weightsFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-destructive" />
                )}
                <p className="font-medium">{weightsFeedback.message}</p>
              </div>
              <button
                onClick={() => setWeightsFeedback(null)}
                className="text-xs opacity-70 hover:opacity-100 underline"
              >
                Fermer
              </button>
            </div>
          )}

          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  Paramétrage de l'Algorithme de Recommandation
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Ajustez les pourcentages accordés à chaque critère pour calculer le score de compatibilité binôme mentee / mentor.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isValidTotal
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isValidTotal ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  Total : {currentTotal} % / 100 %
                </span>

                <Button
                  onClick={handleSaveWeights}
                  disabled={!isValidTotal || isPendingWeights}
                  size="sm"
                  className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-9"
                >
                  {isPendingWeights ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Appliquer les pondérations
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {!isValidTotal && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p>
                    La somme de l'ensemble des pondérations doit faire exactement <strong>100 %</strong>.
                    {currentTotal < 100 ? ` Il manque ${100 - currentTotal} %.` : ` Il y a ${currentTotal - 100} % en trop.`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* 1. Expertise */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">1. Expertise & Compétences</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.expertiseWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Correspondance entre les compétences requises par le bénéficiaire et celles validées chez le mentor.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.expertiseWeight}
                    onChange={(e) => handleWeightChange('expertiseWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* 2. Objectif */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">2. Objectif & Type de Mentoring</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.objectiveWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Adéquation entre les objectifs du mentee (emploi, entrepreneuriat, reconversion) et les missions du mentor.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.objectiveWeight}
                    onChange={(e) => handleWeightChange('objectiveWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* 3. Secteur */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">3. Secteur d'activité</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.sectorWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Alignement sur le même domaine professionnel (Technologies, Agriculture, Finance, etc.).
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.sectorWeight}
                    onChange={(e) => handleWeightChange('sectorWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* 4. Disponibilité */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">4. Disponibilité temporelle</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.availabilityWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Créneaux ouverts et compatibilité des plages horaires de rendez-vous.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.availabilityWeight}
                    onChange={(e) => handleWeightChange('availabilityWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* 5. Langue */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">5. Langues d'échange</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.languageWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Partage d'au moins une langue commune d'échange (Français, Wolof, Anglais...).
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.languageWeight}
                    onChange={(e) => handleWeightChange('languageWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* 6. Format */}
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">6. Format d'accompagnement</span>
                    <span className="font-mono font-bold text-brand-primary">{weights.formatWeight}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Préférence distancielle (visioconférence), présentielle ou mixte.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.formatWeight}
                    onChange={(e) => handleWeightChange('formatWeight', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ONGLET 2: PROGRAMMES DE MENTORING */}
      {activeTab === 'PROGRAMS' && (
        <div className="space-y-6">
          {programFeedback && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 ${
                programFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {programFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-destructive" />
                )}
                <p className="font-medium">{programFeedback.message}</p>
              </div>
              <button
                onClick={() => setProgramFeedback(null)}
                className="text-xs opacity-70 hover:opacity-100 underline"
              >
                Fermer
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Programmes Cadres de Mentoring</h3>
              <p className="text-xs text-muted-foreground">
                Structures institutionnelles ou cohortes spécifiques hébergées sur ACCEENT
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nouveau Programme
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.length > 0 ? (
              programs.map((prog) => (
                <Card key={prog.id} className="shadow-xs border-border/80 flex flex-col justify-between">
                  <CardHeader className="pb-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {prog.territory || 'Sénégal'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-brand-primary flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {prog._count?.journeys || 0} parcours actifs
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground mt-1">
                      {prog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 text-xs">
                    <p className="text-muted-foreground leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="p-3 rounded-xl bg-muted/40 space-y-1 text-[11px]">
                      <p>
                        <strong className="text-foreground">Public cible : </strong>
                        {prog.targetAudience}
                      </p>
                      <p>
                        <strong className="text-foreground">Cible bénéficiaires : </strong>
                        {prog.targetBeneficiaries} participants prévus
                      </p>
                      {(prog.startDate || prog.endDate) && (
                        <p className="flex items-center gap-1 text-muted-foreground pt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/70" />
                          {prog.startDate ? formatDate(prog.startDate) : 'Début'} —{' '}
                          {prog.endDate ? formatDate(prog.endDate) : 'Indéterminé'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border rounded-2xl bg-card border-dashed">
                <Layers className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
                <h4 className="font-semibold text-sm text-foreground">Aucun programme enregistré</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Créez le premier programme pour rattacher les cohortes de bénéficiaires.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Création Programme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-brand-primary">
                <Layers className="w-5 h-5" />
                <h3 className="font-bold text-base text-foreground">
                  Créer un programme de mentoring
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Titre du programme *</label>
                <Input
                  required
                  placeholder="Ex: Cohorte Femmes Entrepreneures du Numérique 2026"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Objectifs et cadre du programme..."
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Public cible *</label>
                <Input
                  required
                  placeholder="Ex: Jeunes diplômées, porteuses de projet tech..."
                  value={newProgram.targetAudience}
                  onChange={(e) => setNewProgram({ ...newProgram, targetAudience: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Territoire</label>
                  <Input
                    placeholder="Sénégal"
                    value={newProgram.territory}
                    onChange={(e) => setNewProgram({ ...newProgram, territory: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Objectif de bénéficiaires *</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={newProgram.targetBeneficiaries}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, targetBeneficiaries: Number(e.target.value) })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Date de début</label>
                  <Input
                    type="date"
                    value={newProgram.startDate}
                    onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Date de fin</label>
                  <Input
                    type="date"
                    value={newProgram.endDate}
                    onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPendingProgram}
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPendingProgram}
                  className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
                >
                  {isPendingProgram ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Création...
                    </>
                  ) : (
                    'Enregistrer le programme'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

