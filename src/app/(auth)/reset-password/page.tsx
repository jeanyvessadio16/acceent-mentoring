import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { ROUTES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | ACCEENT Mentoring",
  description:
    "Choisissez un nouveau mot de passe sécurisé pour accéder à votre espace ACCEENT Mentoring.",
};

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md border border-border/80 shadow-lg bg-white rounded-3xl overflow-hidden">
      <CardHeader className="space-y-3 text-center pb-4 pt-8 px-6 sm:px-8">
        <div className="mx-auto flex justify-center">
          <Link href={ROUTES.HOME} className="inline-block">
            <Image
              src="/logo/Logo-violet-AccEent-Mentoring.png"
              alt="ACCEENT Mentoring"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Définissez un nouveau mot de passe sécurisé pour votre compte
            ACCEENT.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-6">
        <ResetPasswordForm />
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-slate-50/70 px-6 py-4 text-center text-xs text-muted-foreground">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="font-semibold text-primary hover:underline"
        >
          Retour à la page de connexion
        </Link>
      </CardFooter>
    </Card>
  );
}
