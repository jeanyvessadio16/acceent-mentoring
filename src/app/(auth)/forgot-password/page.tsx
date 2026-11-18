import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms";

export const metadata = {
  title: "Mot de passe oublié | ACCEENT Mentoring",
  description: "Réinitialisez le mot de passe de votre compte ACCEENT Mentoring.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardHeader className="text-center space-y-1 pb-4">
        <div className="mx-auto w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent mb-2">
          <KeyRound className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Mot de passe oublié</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Indiquez votre adresse email pour recevoir les instructions de réinitialisation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ForgotPasswordForm />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Retour à la page de connexion</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
