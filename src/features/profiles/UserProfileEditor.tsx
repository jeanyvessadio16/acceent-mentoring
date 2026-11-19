"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Target,
  Globe,
  Clock,
  HeartHandshake,
  Plus,
  X,
  Award,
  ChevronRight,
  Save,
  HelpCircle,
} from "lucide-react";
import type { UserFullProfile } from "@/lib/actions/profile";
import { updateUserFullProfileAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

interface UserProfileEditorProps {
  initialProfile: UserFullProfile;
}

// Suggestions contextuelles ACCEENT
const SUGGESTED_SKILLS = [
  "Développement Web",
  "Marketing Digital",
  "Gestion de Projet",
  "Comptabilité & Finance",
  "Agro-écologie",
  "Vente & Négociation",
  "Communication",
  "Design Graphique",
  "Réseaux Sociaux",
  "Leadership",
  "Intelligence Artificielle",
  "Électrotechnique",
];

const SUGGESTED_INTERESTS = [
  "Tech & Innovation",
  "Entrepreneuriat",
  "Agriculture durable",
  "Impact social",
  "Artisanat & Mode",
  "Énergies Renouvelables",
  "Fintech",
  "Santé & Bien-être",
];

const SUGGESTED_GOALS = [
  "Trouver un premier emploi",
  "Créer et lancer mon entreprise",
  "Améliorer mes compétences techniques",
  "Élargir mon réseau professionnel",
  "Préparer des entretiens d'embauche",
  "Obtenir un financement de projet",
];

const SUGGESTED_LANGUAGES = [
  "Français",
  "Wolof",
  "Anglais",
  "Pulaar",
  "Sérère",
  "Mandingue",
  "Diola",
];

export function UserProfileEditor({ initialProfile }: UserProfileEditorProps) {
  const [profile, setProfile] = useState<UserFullProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<
    "identity" | "inclusion" | "career" | "skills" | "mentor"
  >("identity");

  // Champs de formulaires
  const [firstName, setFirstName] = useState(profile.prenom);
  const [lastName, setLastName] = useState(profile.nom);
  const [phone, setPhone] = useState(profile.telephone || "");
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || "");
  const [pays, setPays] = useState(profile.pays || "Sénégal");
  const [ville, setVille] = useState(profile.ville || "");
  const [localisation, setLocalisation] = useState(profile.localisation || "");

  // Démographie
  const [age, setAge] = useState<number | "">(profile.age ?? "");
  const [sexe, setSexe] = useState<"HOMME" | "FEMME" | "">(profile.sexe || "");
  const [milieuResidence, setMilieuResidence] = useState<
    "RURAL" | "URBAIN" | ""
  >(profile.milieuResidence || "");
  const [situationHandicap, setSituationHandicap] = useState(
    profile.situationHandicap
  );

  // Formation & Carrière
  const [niveauEtude, setNiveauEtude] = useState(profile.niveauEtude || "");
  const [secteurActivite, setSecteurActivite] = useState(
    profile.secteurActivite || ""
  );
  const [anneesExperience, setAnneesExperience] = useState(
    profile.anneesExperience || 0
  );

  // Compétences, Centres d'intérêt, Objectifs
  const [competences, setCompetences] = useState<string[]>(
    profile.competences || []
  );
  const [newCompetenceInput, setNewCompetenceInput] = useState("");

  const [centresInteret, setCentresInteret] = useState<string[]>(
    profile.centresInteret || []
  );
  const [newInteretInput, setNewInteretInput] = useState("");

  const [objectifs, setObjectifs] = useState<string[]>(
    profile.objectifs || []
  );
  const [newObjectifInput, setNewObjectifInput] = useState("");

  const [langues, setLangues] = useState<string[]>(profile.langues || ["Français"]);
  const [newLangueInput, setNewLangueInput] = useState("");

  const [disponibilite, setDisponibilite] = useState(
    profile.disponibilite || ""
  );
  const [isPublic, setIsPublic] = useState(profile.isPublic);

  // Mentor spécifique
  const isMentorOrExpert =
    profile.role === "MENTOR" || profile.role === "EXPERT";
  const [fonction, setFonction] = useState(
    profile.mentorProfile?.fonction || ""
  );
  const [organisation, setOrganisation] = useState(
    profile.mentorProfile?.organisation || ""
  );
  const [biographie, setBiographie] = useState(
    profile.mentorProfile?.biographie || ""
  );
  const [typesMentoring, setTypesMentoring] = useState<
    "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX"
  >(
    (profile.mentorProfile?.typesMentoring as any) || "INDIVIDUEL"
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    profile.mentorProfile?.linkedinUrl || ""
  );

  // Transition & Feedback
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Gestion des tags
  const handleAddTag = (
    list: string[],
    setList: (val: string[]) => void,
    val: string,
    clearInput: () => void
  ) => {
    const trimmed = val.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    clearInput();
  };

  const handleRemoveTag = (
    list: string[],
    setList: (val: string[]) => void,
    val: string
  ) => {
    setList(list.filter((item) => item !== val));
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      firstName,
      lastName,
      phone,
      photoUrl,
      pays,
      ville,
      localisation,
      age: age === "" ? null : Number(age),
      sexe: sexe || undefined,
      milieuResidence: milieuResidence || undefined,
      situationHandicap,
      niveauEtude,
      secteurActivite,
      anneesExperience: Number(anneesExperience),
      competences,
      centresInteret,
      objectifs,
      langues,
      disponibilite,
      isPublic,
      fonction,
      organisation,
      biographie,
      typesMentoring,
      linkedinUrl,
    };

    startTransition(async () => {
      try {
        const result = await updateUserFullProfileAction(payload);
        if (result.success) {
          setFeedback({
            type: "success",
            message: result.message,
          });
          if (typeof result.completionScore === "number") {
            setProfile((prev) => ({
              ...prev,
              prenom: firstName,
              nom: lastName,
              telephone: phone || null,
              age: age === "" ? null : Number(age),
              sexe: sexe || null,
              milieuResidence: milieuResidence || null,
              situationHandicap,
              ville: ville || null,
              niveauEtude: niveauEtude || null,
              secteurActivite: secteurActivite || null,
              competences,
              objectifs,
              completionScore: result.completionScore!,
              missingFields: prev.missingFields.filter(
                (f) =>
                  !(f.includes("Nom") && firstName && lastName) &&
                  !(f.includes("Téléphone") && phone) &&
                  !(f.includes("Âge") && age && sexe) &&
                  !(f.includes("Milieu") && milieuResidence) &&
                  !(f.includes("Ville") && ville) &&
                  !(f.includes("Niveau") && niveauEtude) &&
                  !(f.includes("Secteur") && secteurActivite) &&
                  !(f.includes("Compétences") && competences.length > 0) &&
                  !(f.includes("Objectifs") && objectifs.length > 0)
              ),
            }));
          }
        } else {
          setFeedback({
            type: "error",
            message: result.message || "Erreur lors de la mise à jour.",
          });
        }
      } catch {
        setFeedback({
          type: "error",
          message: "Une erreur réseau inattendue est survenue.",
        });
      }
    });
  };

  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* Toast de notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-xs transition-all animate-in fade-in-50 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* BANNIÈRE DE COMPLÉTION DU PROFIL */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {firstName} {lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/15 text-secondary border border-secondary/30">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profile.email}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold text-muted-foreground">
              Taux de complétion
            </span>
            <div className="flex items-center sm:justify-end gap-2 mt-0.5">
              <span
                className={`text-2xl font-black ${
                  profile.completionScore >= 80
                    ? "text-emerald-600"
                    : profile.completionScore >= 50
                    ? "text-primary"
                    : "text-amber-600"
                }`}
              >
                {profile.completionScore}%
              </span>
              <span className="text-xs text-muted-foreground">
                {profile.completionScore === 100
                  ? "Profil complet !"
                  : "à compléter"}
              </span>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                profile.completionScore >= 80
                  ? "bg-emerald-500"
                  : profile.completionScore >= 50
                  ? "bg-primary"
                  : "bg-amber-500"
              }`}
              style={{ width: `${profile.completionScore}%` }}
            />
          </div>

          {profile.missingFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Recommandé pour atteindre 100% :
              </span>
              {profile.missingFields.slice(0, 3).map((field, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                >
                  + {field}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FORMULAIRE PRINCIPAL AVEC ONGLETS */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation des onglets */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "identity"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            Identité & Coordonnées
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inclusion")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "inclusion"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            Démographie & Inclusion
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("career")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "career"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Formation & Métier
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "skills"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Compétences & Objectifs
          </button>

          {isMentorOrExpert && (
            <button
              type="button"
              onClick={() => setActiveTab("mentor")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "mentor"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Profil Mentorat
            </button>
          )}
        </div>

        {/* SECTION 1 : IDENTITÉ & COORDONNÉES */}
        {activeTab === "identity" && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-5 animate-in fade-in-50">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Informations Personnelles
              </h3>
              <p className="text-xs text-muted-foreground">
                Vos coordonnées principales pour le contact et le suivi sur la plateforme.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex : Fatou"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex : Diassy"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Adresse Email <span className="text-slate-400 font-normal">(Compte vérifié)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  L'adresse email est liée à vos identifiants d'accès.
                </span>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Pays de résidence
                </label>
                <input
                  type="text"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Sénégal"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Ville / Région
                </label>
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex : Dakar, Thiès, Saint-Louis..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-foreground block mb-1.5">
                  Photo de profil (URL de l'image)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 : DÉMOGRAPHIE & INCLUSION */}
        {activeTab === "inclusion" && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-5 animate-in fade-in-50">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Profil Démographique & Inclusion Sociale
              </h3>
              <p className="text-xs text-muted-foreground">
                Ces informations nous permettent d'adapter nos programmes d'accompagnement et d'assurer une inclusion équitable.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-xs text-secondary-foreground space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                Protection stricte de vos données sensibles
              </div>
              <p className="text-[11px] text-muted-foreground">
                Conformément à notre charte éthique, vos déclarations relatives au handicap (SDH) ou à votre milieu de résidence ne sont jamais transmises à des tiers sans votre consentement préalable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Âge
                </label>
                <input
                  type="number"
                  min={15}
                  max={100}
                  value={age}
                  onChange={(e) =>
                    setAge(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex : 24"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Sexe
                </label>
                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez votre sexe</option>
                  <option value="FEMME">Femme</option>
                  <option value="HOMME">Homme</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Milieu de résidence
                </label>
                <select
                  value={milieuResidence}
                  onChange={(e) => setMilieuResidence(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez le milieu</option>
                  <option value="URBAIN">Urbain (Ville, centre métropolitain)</option>
                  <option value="RURAL">Rural (Village, commune rurale)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">
                    Situation de Handicap (SDH)
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Permet de bénéficier d'aménagements et de mentors formés.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={situationHandicap}
                    onChange={(e) => setSituationHandicap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 : FORMATION & CARRIÈRE */}
        {activeTab === "career" && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-5 animate-in fade-in-50">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Parcours, Études & Expérience
              </h3>
              <p className="text-xs text-muted-foreground">
                Partagez votre formation et votre secteur d'intérêt pour affiner le matching avec vos mentors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Niveau d'études
                </label>
                <select
                  value={niveauEtude}
                  onChange={(e) => setNiveauEtude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="Enseignement secondaire">Enseignement secondaire (Collège / Lycée)</option>
                  <option value="Baccalauréat">Baccalauréat</option>
                  <option value="Bac +2 / BTS / DUT">Bac +2 (BTS / DUT / DEUG)</option>
                  <option value="Licence / Bachelor">Licence / Bachelor (Bac +3)</option>
                  <option value="Master / Ingénieur">Master / Diplôme d'Ingénieur (Bac +5)</option>
                  <option value="Doctorat / PhD">Doctorat / PhD</option>
                  <option value="Formation Professionnelle">Formation Professionnelle certifiante</option>
                  <option value="Autodidacte">Autodidacte</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Secteur d'activité principal
                </label>
                <select
                  value={secteurActivite}
                  onChange={(e) => setSecteurActivite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez votre secteur</option>
                  <option value="Technologies de l'Information & Digital">Technologies de l'Information & Digital</option>
                  <option value="Agriculture & Agro-industrie">Agriculture & Agro-industrie</option>
                  <option value="Commerce, Vente & Distribution">Commerce, Vente & Distribution</option>
                  <option value="Artisanat, Couture & Métiers d'Art">Artisanat, Couture & Métiers d'Art</option>
                  <option value="Santé & Action Sociale">Santé & Action Sociale</option>
                  <option value="Éducation, Formation & Enseignement">Éducation, Formation & Enseignement</option>
                  <option value="Banque, Microfinance & Assurance">Banque, Microfinance & Assurance</option>
                  <option value="Énergies Renouvelables & Environnement">Énergies Renouvelables & Environnement</option>
                  <option value="Transport & Logistique">Transport & Logistique</option>
                  <option value="Tourisme, Hôtellerie & Restauration">Tourisme, Hôtellerie & Restauration</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Années d'expérience professionnelle
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={anneesExperience}
                  onChange={(e) => setAnneesExperience(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Disponibilité hebdomadaire pour les sessions
                </label>
                <input
                  type="text"
                  value={disponibilite}
                  onChange={(e) => setDisponibilite(e.target.value)}
                  placeholder="Ex : 2 heures par semaine, les samedis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4 : COMPÉTENCES & OBJECTIFS */}
        {activeTab === "skills" && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-6 animate-in fade-in-50">
            {/* Compétences clés */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Compétences Clés & Savoir-faire
                </h4>
                <p className="text-xs text-muted-foreground">
                  Indiquez vos compétences actuelles ou celles que vous souhaitez développer.
                </p>
              </div>

              {/* Tags existants */}
              <div className="flex flex-wrap gap-2">
                {competences.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveTag(competences, setCompetences, tag)
                      }
                      className="hover:text-red-600 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Input tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCompetenceInput}
                  onChange={(e) => setNewCompetenceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(
                        competences,
                        setCompetences,
                        newCompetenceInput,
                        () => setNewCompetenceInput("")
                      );
                    }
                  }}
                  placeholder="Ajouter une compétence (ex: Gestion de projet)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddTag(
                      competences,
                      setCompetences,
                      newCompetenceInput,
                      () => setNewCompetenceInput("")
                    )
                  }
                  className="text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>

              {/* Suggestions en un clic */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 font-medium">Suggestions :</span>
                {SUGGESTED_SKILLS.filter((s) => !competences.includes(s))
                  .slice(0, 6)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCompetences([...competences, s])}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Objectifs prioritaires */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Objectifs de Mentorat
                </h4>
                <p className="text-xs text-muted-foreground">
                  Quels résultats concrets espérez-vous atteindre avec votre mentor ?
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {objectifs.map((obj) => (
                  <span
                    key={obj}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {obj}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveTag(objectifs, setObjectifs, obj)
                      }
                      className="hover:text-red-600 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjectifInput}
                  onChange={(e) => setNewObjectifInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(
                        objectifs,
                        setObjectifs,
                        newObjectifInput,
                        () => setNewObjectifInput("")
                      );
                    }
                  }}
                  placeholder="Ajouter un objectif précis..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-border text-xs focus:outline-none focus:border-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddTag(
                      objectifs,
                      setObjectifs,
                      newObjectifInput,
                      () => setNewObjectifInput("")
                    )
                  }
                  className="text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 font-medium">Suggestions :</span>
                {SUGGESTED_GOALS.filter((g) => !objectifs.includes(g))
                  .slice(0, 4)
                  .map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setObjectifs([...objectifs, g])}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      + {g}
                    </button>
                  ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Langues maîtrisées */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Langues de communication
                </h4>
                <p className="text-xs text-muted-foreground">
                  Indiquez les langues dans lesquelles vous êtes à l'aise pour échanger.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {langues.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(langues, setLangues, lang)}
                      className="hover:text-red-600 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 font-medium">Langues fréquentes :</span>
                {SUGGESTED_LANGUAGES.filter((l) => !langues.includes(l)).map(
                  (l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLangues([...langues, l])}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      + {l}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5 : PROFIL MENTOR (SI MENTOR / EXPERT) */}
        {isMentorOrExpert && activeTab === "mentor" && (
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-5 animate-in fade-in-50">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Profil Mentorat & Expérience
              </h3>
              <p className="text-xs text-muted-foreground">
                Présentez votre parcours professionnel et vos méthodes d'accompagnement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Fonction / Poste actuel
                </label>
                <input
                  type="text"
                  value={fonction}
                  onChange={(e) => setFonction(e.target.value)}
                  placeholder="Ex : Responsable R&D / Fondateur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Organisation / Entreprise
                </label>
                <input
                  type="text"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="Ex : Teranga Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Format de mentorat proposé
                </label>
                <select
                  value={typesMentoring}
                  onChange={(e) => setTypesMentoring(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="INDIVIDUEL">Individuel (One-to-One)</option>
                  <option value="COLLECTIF">Collectif (Masterclass / Cohorte)</option>
                  <option value="LES_DEUX">Les deux (Hybride)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Profil LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/votre-profil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-foreground block mb-1.5">
                  Biographie professionnelle & Vision du mentorat
                </label>
                <textarea
                  rows={4}
                  value={biographie}
                  onChange={(e) => setBiographie(e.target.value)}
                  placeholder="Décrivez votre parcours, vos réussites et comment vous souhaitez accompagner les jeunes talents..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* BOUTON D'ENREGISTREMENT FLOTTANT / BAS DE PAGE */}
        <div className="p-4 bg-white rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Vos modifications sont immédiatement enregistrées dans la base de données.
          </p>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm gap-2 ml-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer mon profil
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
