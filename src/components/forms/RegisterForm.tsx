"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  GraduationCap,
  Briefcase,
  Award,
  Handshake,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Shield,
  FileText,
  Upload,
  Plus,
  X,
} from "lucide-react";

import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { registerAction } from "@/lib/actions/auth";
import { ROUTES } from "@/lib/constants";
import { MAX_CV_FILE_BYTES, formatFileSize } from "@/lib/utils/cv-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ACCOUNT_TYPES = [
  {
    id: "beneficiary",
    label: "Bénéficiaire",
    description: "Jeune, femme entrepreneure, porteur de projet cherchant un mentor",
    icon: GraduationCap,
    requiresValidation: false,
  },
  {
    id: "mentor",
    label: "Mentor",
    description: "Professionnel ou dirigeant souhaitant accompagner bénévolement",
    icon: Briefcase,
    requiresValidation: true,
  },
  {
    id: "expert",
    label: "Expert",
    description: "Spécialiste ponctuel sur des problématiques sectorielles pointues",
    icon: Award,
    requiresValidation: true,
  },
  {
    id: "partner",
    label: "Partenaire",
    description: "Entreprise, bailleur ou institution souhaitant soutenir les talents",
    icon: Handshake,
    requiresValidation: true,
  },
] as const;

const SUGGESTED_SECTORS = [
  "Numérique & Tech",
  "Agrobusiness",
  "Finance & Banque",
  "Énergies & Environnement",
  "Santé",
  "Commerce & Vente",
  "Éducation & Formation",
  "Industrie & Artisanat",
];

const SUGGESTED_EXPERTISES = [
  "Entrepreneuriat",
  "Développement Web",
  "Marketing Digital",
  "Levée de fonds",
  "Gestion de projet",
  "Leadership",
  "Comptabilité & Finance",
  "Stratégie commerciale",
  "RH & Recrutement",
  "Droit des affaires",
];

interface RegisterFormProps {
  onSuccess?: (data: RegisterFormData) => void;
  className?: string;
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // États spécifiques aux Mentors / Experts (CV PDF & tags personnalisés)
  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [isDraggingCv, setIsDraggingCv] = useState(false);
  const [customSectorInput, setCustomSectorInput] = useState("");
  const [customExpertiseInput, setCustomExpertiseInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      accountType: "beneficiary",
      firstName: "",
      lastName: "",
      sexe: "Femme",
      milieuResidence: "Urbain",
      sdh: "Non",
      email: "",
      phone: "",
      country: "",
      langue: "fr",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
      newsletter: false,
      fonction: "",
      organisation: "",
      typesMentoring: "INDIVIDUEL",
      secteurs: [],
      expertises: [],
      biographie: "",
      disponibilites: "",
      linkedinUrl: "",
      references: "",
    },
  });

  const selectedAccountType = watch("accountType");
  const acceptTerms = watch("acceptTerms");
  const acceptPrivacy = watch("acceptPrivacy");
  const newsletter = watch("newsletter");
  const selectedSectors = watch("secteurs") || [];
  const selectedExpertises = watch("expertises") || [];
  const biographieValue = watch("biographie") || "";

  useEffect(() => {
    const roleParam = new URLSearchParams(window.location.search)
      .get("role")
      ?.toLowerCase();
    if (
      roleParam === "beneficiary" ||
      roleParam === "mentor" ||
      roleParam === "expert" ||
      roleParam === "partner"
    ) {
      setValue("accountType", roleParam);
    }
  }, [setValue]);

  const isValidationRequired =
    selectedAccountType === "mentor" || selectedAccountType === "expert";

  const steps = isValidationRequired
    ? ([
        { number: 1, title: "Profil", icon: Briefcase },
        { number: 2, title: "Identité", icon: User },
        { number: 3, title: "Expertise & CV", icon: FileText },
        { number: 4, title: "Sécurité", icon: Shield },
      ] as const)
    : ([
        { number: 1, title: "Profil", icon: Briefcase },
        { number: 2, title: "Identité", icon: User },
        { number: 3, title: "Sécurité", icon: Shield },
      ] as const);

  const securityStepNumber = isValidationRequired ? 4 : 3;

  // Gestion sélection / validation immédiate du fichier CV (PDF uniquement)
  const handleSelectCvFile = (file: File) => {
    setCvError(null);
    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setCvFile(null);
      setCvError("Format non supporté. Veuillez téléverser votre CV au format PDF uniquement.");
      return;
    }

    if (file.size <= 0) {
      setCvFile(null);
      setCvError("Le fichier CV sélectionné est vide.");
      return;
    }

    if (file.size > MAX_CV_FILE_BYTES) {
      setCvFile(null);
      setCvError("Le fichier CV ne doit pas dépasser 5 Mo.");
      return;
    }

    setCvFile(file);
  };

  // Gestion des tags (secteurs & expertises)
  const toggleArrayField = (
    field: "secteurs" | "expertises",
    currentList: string[],
    item: string
  ) => {
    const next = currentList.includes(item)
      ? currentList.filter((v) => v !== item)
      : [...currentList, item];
    setValue(field, next, { shouldValidate: true });
  };

  const addCustomTag = (
    field: "secteurs" | "expertises",
    currentList: string[],
    rawValue: string,
    clearInput: () => void
  ) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    if (!currentList.includes(trimmed)) {
      setValue(field, [...currentList, trimmed], { shouldValidate: true });
    }
    clearInput();
  };

  // Navigation par étape avec validation ciblée
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(["accountType"]);
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await trigger([
        "firstName",
        "lastName",
        "age",
        "sexe",
        "phone",
        "country",
        "langue",
        "milieuResidence",
        "sdh",
      ]);
      if (isValid) setCurrentStep(3);
    } else if (currentStep === 3 && isValidationRequired) {
      const isFieldsValid = await trigger([
        "fonction",
        "organisation",
        "anneesExperience",
        "typesMentoring",
        "secteurs",
        "expertises",
        "biographie",
        "linkedinUrl",
        "disponibilites",
        "references",
      ]);

      let hasValidCv = cvFile !== null;
      if (!cvFile) {
        setCvError("Veuillez joindre votre CV au format PDF pour continuer.");
        hasValidCv = false;
      }

      if (isFieldsValid && hasValidCv) {
        setCurrentStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (isValidationRequired && !cvFile) {
      setCvError("Veuillez joindre votre CV au format PDF pour soumettre votre candidature.");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(data));
      if (isValidationRequired && cvFile) {
        formData.append("cvFile", cvFile);
      }

      const res = await registerAction(formData);

      if (res.success) {
        setFeedback({
          type: "success",
          message:
            "Compte créé avec succès ! Redirection vers la page de connexion...",
        });

        if (onSuccess) {
          onSuccess(data);
        }

        router.push(`${ROUTES.AUTH.LOGIN}?registered=1`);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Une erreur est survenue lors de l'inscription.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Une erreur est survenue lors de l'inscription. Veuillez vérifier vos données.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {/* Stepper compact */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <div key={step.number} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div
                    aria-hidden="true"
                    className={`absolute top-3.5 -left-1/2 w-full h-[2px] transition-colors duration-300 ${
                      currentStep >= step.number ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (step.number < currentStep) {
                      setCurrentStep(step.number as 1 | 2 | 3 | 4);
                    }
                  }}
                  disabled={step.number > currentStep}
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCompleted
                      ? "bg-secondary text-white cursor-pointer hover:bg-secondary/90 shadow-sm"
                      : isCurrent
                      ? "bg-primary text-white ring-2 ring-primary/30 shadow-sm"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  aria-label={`Étape ${step.number}: ${step.title}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden /> : step.number}
                </button>

                <span
                  className={`mt-0.5 text-[10px] sm:text-xs font-medium text-center transition-colors ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                      ? "text-secondary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Barre de progression fluide */}
        <div className="w-full bg-border/60 h-1 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`mb-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
            feedback.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ========================================================================= */}
        {/* ÉTAPE 1 : CHOIX DU PROFIL / RÔLE                                          */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">Choisissez votre profil</h3>
              <p className="text-[11px] text-muted-foreground">
                Sélectionnez votre rôle pour adapter votre accompagnement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedAccountType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("accountType", type.id, { shouldValidate: true })}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? "border-secondary bg-secondary/5 ring-1 ring-secondary/40 shadow-sm"
                        : "border-border hover:border-secondary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {type.label}
                        </p>
                        {type.requiresValidation && (
                          <span className="text-[9px] font-semibold bg-accent/20 text-accent-foreground px-1.5 py-0.2 rounded-full shrink-0">
                            Validation
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.accountType && (
              <p className="text-xs text-destructive">{errors.accountType.message}</p>
            )}

            {isValidationRequired && (
              <div className="p-2 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2 text-[11px] text-primary leading-tight">
                <Info className="h-3.5 w-3.5 shrink-0 text-accent mt-0.5" aria-hidden />
                <span>
                  <strong>Information :</strong> Un dossier complémentaire (poste, domaines d&apos;expertise et <strong>CV au format PDF</strong>) sera demandé à l&apos;étape 3 pour validation administrative.
                </span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 mt-2 rounded-full"
            >
              <span>Continuer vers mes informations</span>
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 2 : INFORMATIONS PERSONNELLES                                       */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-2.5">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">Vos informations personnelles</h3>
              <p className="text-[11px] text-muted-foreground">
                Ces données permettent d&apos;identifier votre compte et d&apos;assurer l&apos;inclusion.
              </p>
            </div>

            {/* Ligne 1 : Prénom & Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Votre prénom"
                  aria-invalid={!!errors.firstName}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-destructive leading-none">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Votre nom"
                  aria-invalid={!!errors.lastName}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-destructive leading-none">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Ligne 2 : Âge & Sexe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="age" className="text-xs">
                  Âge <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={15}
                  max={100}
                  placeholder="Votre âge"
                  aria-invalid={!!errors.age}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("age", {
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined ? undefined : Number(v),
                  })}
                />
                {errors.age && (
                  <p className="text-[11px] text-destructive leading-none">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="sexe" className="text-xs">
                  Sexe <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sexe"
                  aria-invalid={!!errors.sexe}
                  disabled={isSubmitting}
                  className="h-9 rounded-full w-full border border-input bg-card px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("sexe")}
                >
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                </select>
                {errors.sexe && (
                  <p className="text-[11px] text-destructive leading-none">{errors.sexe.message}</p>
                )}
              </div>
            </div>

            {/* Ligne 3 : Téléphone & Pays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">
                  Téléphone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Votre numéro de téléphone"
                  aria-invalid={!!errors.phone}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-[11px] text-destructive leading-none">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs">
                  Pays de résidence <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="country"
                  autoComplete="country-name"
                  placeholder="Votre pays de résidence"
                  aria-invalid={!!errors.country}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-[11px] text-destructive leading-none">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Ligne 4 : Milieu de résidence & Situation de Handicap (SDH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="milieuResidence" className="text-xs">
                  Milieu de résidence <span className="text-destructive">*</span>
                </Label>
                <select
                  id="milieuResidence"
                  aria-invalid={!!errors.milieuResidence}
                  disabled={isSubmitting}
                  className="h-9 rounded-full w-full border border-input bg-card px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("milieuResidence")}
                >
                  <option value="Urbain">Urbain</option>
                  <option value="Rural">Rural</option>
                </select>
                {errors.milieuResidence && (
                  <p className="text-[11px] text-destructive leading-none">{errors.milieuResidence.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="sdh" className="text-xs">
                  Handicap (SDH) <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sdh"
                  aria-invalid={!!errors.sdh}
                  disabled={isSubmitting}
                  className="h-9 rounded-full w-full border border-input bg-card px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("sdh")}
                >
                  <option value="Non">Non</option>
                  <option value="Oui">Oui (Situation de Handicap)</option>
                </select>
                {errors.sdh && (
                  <p className="text-[11px] text-destructive leading-none">{errors.sdh.message}</p>
                )}
              </div>
            </div>

            {/* Ligne 5 : Langue préférée */}
            <div className="space-y-1">
              <Label htmlFor="langue" className="text-xs">
                Langue préférée
              </Label>
              <select
                id="langue"
                disabled={isSubmitting}
                className="h-9 rounded-full w-full border border-input bg-card px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("langue")}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Boutons de navigation Étape 2 */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="w-1/3 h-10 rounded-full border-border hover:bg-muted font-medium text-foreground text-xs"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
                <span>Précédent</span>
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-2/3 h-10 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
              >
                <span>
                  {isValidationRequired
                    ? "Continuer vers le dossier & CV"
                    : "Continuer vers la sécurité"}
                </span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 3 CONDITIONNELLE : DOSSIER MENTOR / EXPERT & CV (PDF)               */}
        {/* ========================================================================= */}
        {isValidationRequired && currentStep === 3 && (
          <div className="space-y-3">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">
                Dossier {selectedAccountType === "expert" ? "Expert" : "Mentor"} &amp; CV
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Complétez votre profil professionnel et joignez votre CV (PDF) pour validation.
              </p>
            </div>

            {/* Ligne 1 : Fonction & Organisation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="fonction" className="text-xs">
                  Fonction / Poste actuel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fonction"
                  placeholder="Votre fonction ou poste actuel"
                  aria-invalid={!!errors.fonction}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("fonction")}
                />
                {errors.fonction && (
                  <p className="text-[11px] text-destructive leading-none">{errors.fonction.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="organisation" className="text-xs">
                  Organisation / Entreprise <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="organisation"
                  placeholder="Votre organisation ou entreprise"
                  aria-invalid={!!errors.organisation}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("organisation")}
                />
                {errors.organisation && (
                  <p className="text-[11px] text-destructive leading-none">{errors.organisation.message}</p>
                )}
              </div>
            </div>

            {/* Ligne 2 : Années d'expérience & Format d'accompagnement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="anneesExperience" className="text-xs">
                  Années d&apos;expérience <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="anneesExperience"
                  type="number"
                  min={1}
                  max={60}
                  placeholder="Nombre d'années"
                  aria-invalid={!!errors.anneesExperience}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("anneesExperience", {
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined ? undefined : Number(v),
                  })}
                />
                {errors.anneesExperience && (
                  <p className="text-[11px] text-destructive leading-none">
                    {errors.anneesExperience.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="typesMentoring" className="text-xs">
                  Format d&apos;accompagnement <span className="text-destructive">*</span>
                </Label>
                <select
                  id="typesMentoring"
                  disabled={isSubmitting}
                  className="h-9 rounded-full w-full border border-input bg-card px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  {...register("typesMentoring")}
                >
                  <option value="INDIVIDUEL">Individuel (1:1)</option>
                  <option value="COLLECTIF">Collectif (Masterclass / Cohorte)</option>
                  <option value="LES_DEUX">Les deux (Hybride)</option>
                </select>
              </div>
            </div>

            {/* Secteurs d'activité */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Secteurs d&apos;activité <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SECTORS.map((sec) => {
                  const isSelected = selectedSectors.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => toggleArrayField("secteurs", selectedSectors, sec)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                        isSelected
                          ? "bg-secondary text-white border-secondary"
                          : "bg-slate-50 text-slate-700 border-border hover:bg-slate-100"
                      }`}
                    >
                      {sec} {isSelected && "✓"}
                    </button>
                  );
                })}
                {selectedSectors
                  .filter((s) => !SUGGESTED_SECTORS.includes(s))
                  .map((customSec) => (
                    <span
                      key={customSec}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-white"
                    >
                      {customSec}
                      <button
                        type="button"
                        onClick={() => toggleArrayField("secteurs", selectedSectors, customSec)}
                        aria-label={`Retirer ${customSec}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={customSectorInput}
                  onChange={(e) => setCustomSectorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag("secteurs", selectedSectors, customSectorInput, () =>
                        setCustomSectorInput("")
                      );
                    }
                  }}
                  placeholder="Autre secteur (optionnel)..."
                  disabled={isSubmitting}
                  className="h-8 rounded-full text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addCustomTag("secteurs", selectedSectors, customSectorInput, () =>
                      setCustomSectorInput("")
                    )
                  }
                  className="h-8 px-3 rounded-full text-xs gap-1 shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </Button>
              </div>
              {errors.secteurs && (
                <p className="text-[11px] text-destructive leading-none">{errors.secteurs.message}</p>
              )}
            </div>

            {/* Domaines d'expertise */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Domaines d&apos;expertise <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_EXPERTISES.map((exp) => {
                  const isSelected = selectedExpertises.includes(exp);
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => toggleArrayField("expertises", selectedExpertises, exp)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 text-slate-700 border-border hover:bg-slate-100"
                      }`}
                    >
                      {exp} {isSelected && "✓"}
                    </button>
                  );
                })}
                {selectedExpertises
                  .filter((e) => !SUGGESTED_EXPERTISES.includes(e))
                  .map((customExp) => (
                    <span
                      key={customExp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary text-white"
                    >
                      {customExp}
                      <button
                        type="button"
                        onClick={() => toggleArrayField("expertises", selectedExpertises, customExp)}
                        aria-label={`Retirer ${customExp}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={customExpertiseInput}
                  onChange={(e) => setCustomExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag("expertises", selectedExpertises, customExpertiseInput, () =>
                        setCustomExpertiseInput("")
                      );
                    }
                  }}
                  placeholder="Autre expertise (optionnel)..."
                  disabled={isSubmitting}
                  className="h-8 rounded-full text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addCustomTag("expertises", selectedExpertises, customExpertiseInput, () =>
                      setCustomExpertiseInput("")
                    )
                  }
                  className="h-8 px-3 rounded-full text-xs gap-1 shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </Button>
              </div>
              {errors.expertises && (
                <p className="text-[11px] text-destructive leading-none">{errors.expertises.message}</p>
              )}
            </div>

            {/* Présentation du parcours / biographie */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="biographie" className="text-xs">
                  Présentation du parcours &amp; motivation <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-[10px] font-medium ${
                    biographieValue.trim().length >= 30
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {biographieValue.trim().length} / 30 car. min
                </span>
              </div>
              <textarea
                id="biographie"
                rows={3}
                disabled={isSubmitting}
                placeholder="Décrivez brièvement votre expérience professionnelle et votre approche du mentorat..."
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                {...register("biographie")}
              />
              {errors.biographie && (
                <p className="text-[11px] text-destructive leading-none">{errors.biographie.message}</p>
              )}
            </div>

            {/* Téléversement du CV (PDF uniquement) */}
            <div className="space-y-1">
              <Label className="text-xs">
                Curriculum Vitae (CV au format PDF) <span className="text-destructive">*</span>
              </Label>
              <input
                ref={cvInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    handleSelectCvFile(selected);
                  }
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCv(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingCv(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCv(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) {
                    handleSelectCvFile(dropped);
                  }
                }}
                className={`p-3 rounded-xl border-2 border-dashed transition-colors ${
                  isDraggingCv
                    ? "border-primary bg-primary/5"
                    : cvError
                    ? "border-destructive/60 bg-destructive/5"
                    : cvFile
                    ? "border-secondary/50 bg-secondary/5"
                    : "border-border bg-slate-50/70"
                }`}
              >
                {cvFile ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {cvFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          PDF · {formatFileSize(cvFile.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cvInputRef.current?.click()}
                        className="h-7 px-2.5 text-[11px] rounded-lg"
                      >
                        Changer
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCvFile(null);
                          setCvError(null);
                          if (cvInputRef.current) {
                            cvInputRef.current.value = "";
                          }
                        }}
                        aria-label="Retirer le CV"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Téléversez votre CV (PDF · 5 Mo max)
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Glissez-déposez votre fichier ou sélectionnez-le depuis votre appareil
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cvInputRef.current?.click()}
                      className="h-8 px-3 text-xs rounded-full shrink-0"
                    >
                      Choisir un fichier PDF
                    </Button>
                  </div>
                )}
              </div>
              {cvError && <p className="text-[11px] text-destructive leading-none">{cvError}</p>}
            </div>

            {/* Informations complémentaires facultatives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="linkedinUrl" className="text-xs">
                  Profil LinkedIn <span className="text-muted-foreground font-normal">(facultatif)</span>
                </Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="Lien vers votre profil LinkedIn"
                  aria-invalid={!!errors.linkedinUrl}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("linkedinUrl")}
                />
                {errors.linkedinUrl && (
                  <p className="text-[11px] text-destructive leading-none">
                    {errors.linkedinUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="disponibilites" className="text-xs">
                  Disponibilités <span className="text-muted-foreground font-normal">(facultatif)</span>
                </Label>
                <Input
                  id="disponibilites"
                  placeholder="Vos créneaux de disponibilité"
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("disponibilites")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="references" className="text-xs">
                Références professionnelles{" "}
                <span className="text-muted-foreground font-normal">(facultatif)</span>
              </Label>
              <Input
                id="references"
                placeholder="Vos références professionnelles ou portfolio"
                disabled={isSubmitting}
                className="h-9 rounded-full text-xs"
                {...register("references")}
              />
            </div>

            {/* Boutons navigation Étape 3 */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="w-1/3 h-10 rounded-full border-border hover:bg-muted font-medium text-foreground text-xs"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
                <span>Précédent</span>
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-2/3 h-10 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
              >
                <span>Continuer vers la sécurité</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DERNIÈRE ÉTAPE : SÉCURITÉ DU COMPTE & CONSENTEMENTS LÉGAUX                */}
        {/* ========================================================================= */}
        {currentStep === securityStepNumber && (
          <div className="space-y-2.5">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">Sécurisez votre compte</h3>
              <p className="text-[11px] text-muted-foreground">
                Définissez vos identifiants d&apos;accès et validez vos consentements.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">
                Adresse email de connexion <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Votre adresse email"
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
                className="h-9 rounded-full text-xs"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive leading-none">{errors.email.message}</p>
              )}
            </div>

            {/* Mots de passe côte-à-côte en 2 colonnes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">
                  Mot de passe <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="8 car. min, 1 maj, 1 symb."
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                    className="pr-9 h-9 rounded-full text-xs"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive leading-none">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirmer mot de passe <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Répétez le mot de passe"
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isSubmitting}
                    className="pr-9 h-9 rounded-full text-xs"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive leading-none">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Consentements et CGU condensés */}
            <div className="space-y-1.5 pt-1.5 border-t border-border">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setValue("acceptTerms", checked === true, { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
                <Label htmlFor="acceptTerms" className="text-[11px] text-foreground cursor-pointer font-normal leading-tight">
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <Link
                    href={ROUTES.LEGAL.CGU}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary font-semibold hover:underline"
                  >
                    Conditions Générales d&apos;Utilisation (CGU)
                  </Link>{" "}
                  <span className="text-destructive">*</span>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-[11px] text-destructive ml-5 leading-none">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="acceptPrivacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) =>
                    setValue("acceptPrivacy", checked === true, { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
                <Label htmlFor="acceptPrivacy" className="text-[11px] text-foreground cursor-pointer font-normal leading-tight">
                  Je consens au traitement de mes{" "}
                  <Link
                    href={ROUTES.LEGAL.PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary font-semibold hover:underline"
                  >
                    données personnelles
                  </Link>{" "}
                  pour le mentoring. <span className="text-destructive">*</span>
                </Label>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-[11px] text-destructive ml-5 leading-none">{errors.acceptPrivacy.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="newsletter"
                  checked={newsletter}
                  onCheckedChange={(checked) => setValue("newsletter", !!checked)}
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
                <Label htmlFor="newsletter" className="text-[11px] text-muted-foreground cursor-pointer font-normal leading-tight">
                  Recevoir les opportunités et masterclasses par email (facultatif).
                </Label>
              </div>
            </div>

            {/* Boutons de navigation dernière étape */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="w-1/3 h-10 rounded-full border-border hover:bg-muted font-medium text-foreground text-xs"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
                <span>Précédent</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 h-10 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
