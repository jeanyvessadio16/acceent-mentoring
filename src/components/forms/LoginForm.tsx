"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { loginAction } from "@/lib/actions/auth";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  onSuccess?: (data: LoginFormData) => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await loginAction(data);

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Connexion réussie. Redirection en cours...",
        });

        if (onSuccess) {
          onSuccess(data);
        }

        // Redirection contextuelle selon le rôle et l'état du profil
        const destination =
          res.redirectUrl ||
          res.dashboardUrl ||
          ROUTES.DASHBOARDS.BENEFICIAIRE;

        router.push(destination);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Identifiants invalides ou problème de connexion.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Identifiants invalides ou problème de connexion au serveur.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {feedback && (
        <div
          role="alert"
          className={`mb-5 p-3 rounded-lg text-sm flex items-start gap-2.5 ${feedback.type === "success"
            ? "bg-success/10 text-success border border-success/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground">
            Adresse email <span className="text-destructive" aria-hidden>*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="votre.email@exemple.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            {...register("email")}
            className="h-10 rounded-full"
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">
              Mot de passe <span className="text-destructive" aria-hidden>*</span>
            </Label>
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs text-secondary hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={isSubmitting}
              className="pr-10 h-10 rounded-full"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Se souvenir de moi */}
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
            disabled={isSubmitting}
          />
          <Label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer font-normal">
            Se souvenir de moi pendant 30 jours
          </Label>
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 mt-2 rounded-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </div>
  );
}
