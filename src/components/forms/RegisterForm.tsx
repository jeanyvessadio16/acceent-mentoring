"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { ROUTES } from "@/lib/constants";
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
    requiresValidation: false,
  },
] as const;

const STEPS = [
  {
    number: 1,
    title: "Profil",
    icon: Briefcase,
  },
  {
    number: 2,
    title: "Identité",
    icon: User,
  },
  {
    number: 3,
    title: "Sécurité",
    icon: Shield,
  },
] as const;

interface RegisterFormProps {
  onSuccess?: (data: RegisterFormData) => void;
  className?: string;
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      age: 25,
      sexe: "Femme",
      milieuResidence: "Urbain",
      sdh: "Non",
      email: "",
      phone: "",
      country: "Sénégal",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
      newsletter: false,
    },
  });

  const selectedAccountType = watch("accountType");
  const acceptTerms = watch("acceptTerms");
  const acceptPrivacy = watch("acceptPrivacy");
  const newsletter = watch("newsletter");

  const isValidationRequired =
    selectedAccountType === "mentor" || selectedAccountType === "expert";

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
        "milieuResidence",
        "sdh",
      ]);
      if (isValid) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Simulation d'appel API d'inscription
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setFeedback({
        type: "success",
        message: isValidationRequired
          ? "Compte créé avec succès ! Votre candidature est soumise pour validation par l'équipe administrative."
          : "Compte créé avec succès ! Un lien de vérification vous a été envoyé par email.",
      });

      if (onSuccess) {
        onSuccess(data);
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
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <div key={step.number} className="flex-1 flex flex-col items-center relative">
                {/* Ligne de connexion entre les étapes */}
                {idx > 0 && (
                  <div
                    aria-hidden="true"
                    className={`absolute top-3.5 -left-1/2 w-full h-[2px] transition-colors duration-300 ${
                      currentStep >= step.number ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}

                {/* Cercle d'étape compact */}
                <button
                  type="button"
                  onClick={() => {
                    if (step.number < currentStep) {
                      setCurrentStep(step.number);
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

                {/* Libellé d'étape */}
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
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
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
        {/* ÉTAPE 1 : CHOIX DU PROFIL / RÔLE (GRID 2x2 ULTRA COMPACTE)                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">Choisissez votre profil</h3>
              <p className="text-[11px] text-muted-foreground">
                Sélectionnez votre rôle pour adapter votre accompagnement.
              </p>
            </div>

            {/* Grille 2x2 des 4 rôles */}
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
                  <strong>Information :</strong> Les profils mentors et experts sont vérifiés par l&apos;équipe administrative avant activation.
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
        {/* ÉTAPE 2 : INFORMATIONS PERSONNELLES (GRID 2 COLONNES CONDENSÉE)           */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-2.5">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-primary">Vos informations personnelles</h3>
              <p className="text-[11px] text-muted-foreground">
                Ces données permettent de calibrer les recommandations de mentors.
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
                  placeholder="Aminata"
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
                  placeholder="Diallo"
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
                  placeholder="Ex: 24"
                  aria-invalid={!!errors.age}
                  disabled={isSubmitting}
                  className="h-9 rounded-full text-xs"
                  {...register("age", { valueAsNumber: true })}
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
                  placeholder="+221 77 123 45 67"
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
                  placeholder="Sénégal"
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
                <span>Continuer vers la sécurité</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 3 : SÉCURITÉ DU COMPTE & CONSENTEMENTS LÉGAUX                       */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
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
                placeholder="aminata.diallo@exemple.com"
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
              {/* Mot de passe */}
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

              {/* Confirmation mot de passe */}
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

            {/* Boutons de navigation Étape 3 */}
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
