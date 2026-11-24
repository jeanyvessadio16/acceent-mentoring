"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Handshake,
  Briefcase,
  GraduationCap,
  Target,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  submitDiagnosticAction,
  type ExistingDiagnosticRecord,
} from "@/lib/actions/diagnostic";
import { ROUTES } from "@/lib/constants";

interface DiagnosticWizardProps {
  initialDiagnostic?: ExistingDiagnosticRecord | null;
}

interface RecommendationItem {
  mentorId: string;
  mentorProfileId: string;
  nom: string;
  prenom: string;
  email: string;
  photoUrl: string | null;
  fonction: string;
  organisation: string;
  anneesExperience: number;
  expertises: string[];
  secteurs: string[];
  scoreTotal: number;
  justification: string;
}

const SITUATION_OPTIONS = [
  { value: "ETUDIANT", label: "Étudiant(e)", desc: "En fin de cycle ou université" },
  { value: "EN_RECHERCHE", label: "En recherche d'emploi", desc: "En quête d'une première opportunité" },
  { value: "PORT_PROJET", label: "Porteur de projet / Entrepreneur", desc: "Création ou développement d'entreprise" },
  { value: "RECONVERSION", label: "En reconversion professionnelle", desc: "Transition vers un nouveau métier" },
  { value: "SALARIE", label: "Professionnel en activité", desc: "Volonté de monter en compétences" },
];

const DOMAINE_OPTIONS = [
  { value: "NUMERIQUE", label: "Numérique & Technologies", desc: "Dév, Data, IA, Cybersécurité, Design" },
  { value: "AGRIBUSINESS", label: "Agrobusiness & Élevage", desc: "Agriculture durable, transformation" },
  { value: "ENERGIE", label: "Énergies & Environnement", desc: "Solaire, climat, développement durable" },
  { value: "SERVICES", label: "Services, Finance & Gestion", desc: "Comptabilité, marketing, logistique" },
  { value: "ARTISANAT", label: "Industrie & Artisanat", desc: "Production locale, textile, mécanique" },
];

const SKILL_SUGGESTIONS = [
  "Développement Web & Mobile",
  "Gestion de projet",
  "Business Model & Stratégie",
  "Recherche de financement",
  "Marketing Digital",
  "Prise de parole & Pitch",
  "Comptabilité & Finance",
  "Management d'équipe",
];

const NEED_SUGGESTIONS = [
  "Conseil stratégique",
  "Revue de code technique",
  "Mise en réseau professionnelle",
  "Validation d'idée de startup",
  "Préparation aux entretiens",
  "Recherche de débouchés",
];

export function DiagnosticWizard({
  initialDiagnostic = null,
}: DiagnosticWizardProps) {
  const router = useRouter();

  // Étape actuelle : 1 à 4 (formulaire), 5 (calcul/résultats)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  // Données du formulaire (pré-remplies uniquement si un diagnostic réel existe déjà en base)
  const [formData, setFormData] = useState({
    situation: initialDiagnostic?.situation ?? "",
    niveau: initialDiagnostic?.niveau ?? "",
    domaine: initialDiagnostic?.domaine ?? "",
    secteur: initialDiagnostic?.secteur ?? "",
    objectifPrincipal: initialDiagnostic?.objectifPrincipal ?? "",
    competences: initialDiagnostic?.competences ?? ([] as string[]),
    besoins: initialDiagnostic?.besoins ?? ([] as string[]),
    typeAccompagnement: initialDiagnostic?.typeAccompagnement ?? "",
    disponibilite: initialDiagnostic?.disponibilite ?? "",
    preferenceMentoring: initialDiagnostic?.preferenceMentoring ?? "",
  });

  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      competences: prev.competences.includes(skill)
        ? prev.competences.filter((s) => s !== skill)
        : [...prev.competences, skill],
    }));
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.competences.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        competences: [...prev.competences, customSkill.trim()],
      }));
      setCustomSkill("");
    }
  };

  const toggleNeed = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      besoins: prev.besoins.includes(need)
        ? prev.besoins.filter((n) => n !== need)
        : [...prev.besoins, need],
    }));
  };

  const goToStep2 = () => {
    if (!formData.situation || !formData.niveau) {
      setErrorMessage("Veuillez sélectionner votre situation actuelle et votre niveau d'expérience.");
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const goToStep3 = () => {
    if (!formData.domaine || !formData.secteur.trim()) {
      setErrorMessage("Veuillez sélectionner un domaine et préciser votre secteur ou métier.");
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const goToStep4 = () => {
    if (!formData.objectifPrincipal.trim()) {
      setErrorMessage("Veuillez préciser votre objectif prioritaire.");
      return;
    }
    if (formData.competences.length === 0 && formData.besoins.length === 0) {
      setErrorMessage("Veuillez sélectionner au moins une compétence cible ou un besoin prioritaire.");
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  const handleSubmit = async () => {
    if (!formData.objectifPrincipal.trim()) {
      setErrorMessage("Veuillez préciser votre objectif principal.");
      setStep(3);
      return;
    }

    if (!formData.typeAccompagnement || !formData.disponibilite || !formData.preferenceMentoring) {
      setErrorMessage("Veuillez choisir votre format d'accompagnement, votre disponibilité et votre canal préféré.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await submitDiagnosticAction(formData);

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue.");
        setIsSubmitting(false);
        return;
      }

      // Récupérer les recommandations renvoyées par le backend
      if (res.data?.topRecommendations) {
        setRecommendations(res.data.topRecommendations);
      }
      setStep(5);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur de connexion."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-md space-y-8">
      {/* Barre de progression des étapes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 text-primary">
            <Compass className="h-4 w-4" />
            <span>Étape {step <= 4 ? step : 4} sur 4</span>
          </span>
          <span>{step === 5 ? "Résultats générés" : `${Math.round((step / 4) * 100)}% complété`}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (step / 4) * 100)}%` }}
          />
        </div>
      </div>

      {initialDiagnostic?.isCompleted && step <= 4 && (
        <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary text-xs font-medium border border-secondary/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Votre diagnostic enregistré a été chargé. Vous pouvez ajuster vos réponses et relancer le matching à tout moment.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
          {errorMessage}
        </div>
      )}

      {/* Étape 1 : Situation & Niveau */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              <span>Votre situation actuelle & maturité</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Afin de calibrer votre accompagnement, précisez votre statut.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Situation professionnelle</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SITUATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, situation: opt.value })}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    formData.situation === opt.value
                      ? "border-secondary bg-secondary/5 ring-1 ring-secondary"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Niveau d&apos;expérience global</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "DEBUTANT", label: "Débutant", desc: "0 à 1 an" },
                { value: "INTERMEDIAIRE", label: "Intermédiaire", desc: "1 à 3 ans" },
                { value: "AVANCE", label: "Avancé", desc: "+ de 3 ans" },
              ].map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, niveau: lvl.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.niveau === lvl.value
                      ? "border-secondary bg-secondary/5 font-semibold text-secondary"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs">{lvl.label}</p>
                  <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={goToStep2}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Étape 2 : Domaine & Secteur */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" />
              <span>Domaine & Secteur d&apos;activité visé</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Permet au moteur de matching d&apos;identifier les mentors de votre écosystème.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Grand domaine</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DOMAINE_OPTIONS.map((dom) => (
                <button
                  key={dom.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, domaine: dom.value })}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    formData.domaine === dom.value
                      ? "border-secondary bg-secondary/5 ring-1 ring-secondary"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{dom.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{dom.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Secteur ou métier précis</label>
            <input
              type="text"
              value={formData.secteur}
              onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
              placeholder="Précisez votre secteur ou métier"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
            <button
              type="button"
              onClick={goToStep3}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Objectif principal & Compétences cibles */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-secondary" />
              <span>Votre objectif & compétences cibles</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Critère majeur (25% à 30% du score de compatibilité du matching).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Quel est votre objectif prioritaire à atteindre dans ce parcours ? *
            </label>
            <textarea
              rows={3}
              value={formData.objectifPrincipal}
              onChange={(e) => setFormData({ ...formData, objectifPrincipal: e.target.value })}
              placeholder="Décrivez votre objectif principal..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Compétences cibles recherchées</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.map((skill) => {
                const selected = formData.competences.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selected
                        ? "bg-secondary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {skill} {selected && "✓"}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                placeholder="Ajouter une autre compétence..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700"
              >
                Ajouter
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Besoins prioritaires</label>
            <div className="flex flex-wrap gap-2">
              {NEED_SUGGESTIONS.map((need) => {
                const selected = formData.besoins.includes(need);
                return (
                  <button
                    key={need}
                    type="button"
                    onClick={() => toggleNeed(need)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selected
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {need} {selected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
            <button
              type="button"
              onClick={goToStep4}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Étape 4 : Format de mentoring & Disponibilités */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <span>Modalités d&apos;accompagnement & Disponibilités</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Ajustez vos préférences de rythme et de communication.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Type d&apos;accompagnement souhaité</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "INDIVIDUEL", label: "Individuel (1:1)" },
                { value: "COLLECTIF", label: "Collectif (groupes)" },
                { value: "LES_DEUX", label: "Les deux" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, typeAccompagnement: opt.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.typeAccompagnement === opt.value
                      ? "border-secondary bg-secondary/5 font-semibold text-secondary"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Créneaux horaires disponibles</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { value: "SEMAINE", label: "En semaine" },
                { value: "SOIR", label: "En soirée" },
                { value: "WEEKEND", label: "Le week-end" },
                { value: "FLEXIBLE", label: "Très flexible" },
              ].map((disp) => (
                <button
                  key={disp.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, disponibilite: disp.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.disponibilite === disp.value
                      ? "border-secondary bg-secondary/5 font-semibold text-secondary"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs">{disp.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">Canal de mentoring préféré</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "VIRTUEL", label: "Visioconférence" },
                { value: "PRESENTIEL", label: "Présentiel" },
                { value: "HYBRIDE", label: "Hybride" },
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferenceMentoring: fmt.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    formData.preferenceMentoring === fmt.value
                      ? "border-secondary bg-secondary/5 font-semibold text-secondary"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs">{fmt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-colors shadow-md disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calcul du matching en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Valider mon diagnostic & Calculer le matching</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Étape 5 : Résultats du Matching & Recommandations (F05) */}
      {step === 5 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-secondary" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary">
              <Handshake className="h-3.5 w-3.5" />
              Matching calculé avec succès
            </span>
            <h2 className="text-2xl font-extrabold text-foreground">
              Vos mentors recommandés sur-mesure
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Grâce à votre diagnostic, notre moteur algorithmique multi-critères a identifié les mentors les plus adaptés pour vous accompagner vers votre objectif.
            </p>
          </div>

          {/* Liste des mentors recommandés */}
          <div className="space-y-3 text-left">
            {recommendations.length > 0 ? (
              recommendations.map((mentor) => (
                <div
                  key={mentor.mentorId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-secondary/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary font-bold text-sm flex items-center justify-center shrink-0 border border-secondary/30">
                      {mentor.prenom[0]}
                      {mentor.nom[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {mentor.prenom} {mentor.nom}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent-foreground">
                          ★ {mentor.scoreTotal}% match
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentor.fonction} · {mentor.organisation}
                      </p>
                      <p className="text-[11px] text-secondary font-medium mt-1">
                        {mentor.justification}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.BENEFICIARY.MENTOR_DETAIL(mentor.mentorProfileId))}
                    className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 transition-colors"
                  >
                    Voir le profil
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-muted-foreground">
                Votre diagnostic a été enregistré ! Les mentors correspondant à vos critères seront notifiés dès leur disponibilité.
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard/beneficiaire")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold text-white bg-secondary hover:bg-secondary/90 shadow-md transition-all"
            >
              <span>Accéder à mon espace bénéficiaire</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
