"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
  className?: string;
}

export function ForgotPasswordForm({ onSuccess, className }: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Simulation d'envoi du lien sécurisé
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);

      if (onSuccess) {
        onSuccess(data.email);
      }
    } catch {
      setErrorMessage("Une erreur est survenue lors de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`space-y-4 py-2 ${className || ""}`}>
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-primary">Email envoyé !</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Si un compte est associé à l&apos;adresse <strong>{getValues("email")}</strong>, vous recevrez un lien de réinitialisation valable 60 minutes.
          </p>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            <span>Vous n&apos;avez rien reçu ?</span>
          </div>
          <p>Pensez à vérifier vos courriers indésirables (spams) ou réessayez avec une autre adresse.</p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          className="w-full text-xs"
        >
          Renvoyer avec une autre adresse
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errorMessage && (
          <div role="alert" className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground">
            Adresse email associée à votre compte <span className="text-destructive">*</span>
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
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Envoi des instructions...
            </>
          ) : (
            "Envoyer le lien de réinitialisation"
          )}
        </Button>
      </form>
    </div>
  );
}
