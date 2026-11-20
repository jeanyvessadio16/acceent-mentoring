"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";

import { resetPasswordAction } from "@/lib/actions/auth";
import { REGEX_PATTERNS } from "@/lib/schemas/auth";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit comporter au moins 8 caractères")
      .regex(
        REGEX_PATTERNS.PASSWORD_UPPERCASE,
        "Le mot de passe doit inclure au moins une lettre majuscule"
      )
      .regex(
        REGEX_PATTERNS.PASSWORD_LOWERCASE,
        "Le mot de passe doit inclure au moins une lettre minuscule"
      )
      .regex(
        REGEX_PATTERNS.PASSWORD_NUMBER,
        "Le mot de passe doit inclure au moins un chiffre"
      )
      .regex(
        REGEX_PATTERNS.PASSWORD_SPECIAL,
        "Le mot de passe doit inclure au moins un caractère spécial (!@#$%...)"
      ),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est obligatoire"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ className }: { className?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || typeof window === "undefined") {
        return;
      }
      const rawHash = window.location.hash;
      if (!rawHash || !rawHash.startsWith("#")) {
        return;
      }
      const hashParams = new URLSearchParams(rawHash.slice(1));
      const token = hashParams.get("access_token");
      if (token) {
        setRecoveryToken(token);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);

    try {
      const result = await resetPasswordAction(data.password, recoveryToken);
      if (!result.success) {
        setServerError(
          result.error || "Impossible de mettre à jour le mot de passe."
        );
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError(
        "Une erreur inattendue est survenue lors de la mise à jour du mot de passe."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 py-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            Mot de passe réinitialisé
          </h3>
          <p className="text-sm text-muted-foreground">
            Votre mot de passe a été mis à jour avec succès. Vous pouvez
            maintenant vous connecter avec vos nouveaux identifiants.
          </p>
        </div>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <span>Se connecter</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-5", className)}
      noValidate
    >
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Nouveau mot de passe <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 caractères"
            className={cn(
              "h-11 bg-white pl-10 pr-10",
              errors.password &&
                "border-destructive focus-visible:ring-destructive/20"
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs font-medium text-destructive">
            {errors.password.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1
            caractère spécial.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Confirmer le mot de passe <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ressaisissez le mot de passe"
            className={cn(
              "h-11 bg-white pl-10 pr-10",
              errors.confirmPassword &&
                "border-destructive focus-visible:ring-destructive/20"
            )}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showConfirmPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-white hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour en cours...
          </>
        ) : (
          "Enregistrer le nouveau mot de passe"
        )}
      </Button>
    </form>
  );
}
