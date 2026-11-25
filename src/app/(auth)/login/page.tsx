import { Suspense } from "react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoginForm } from "@/components/forms";
import Image from "next/image";

export const metadata = {
  title: "Connexion | ACCEENT Mentoring",
  description: "Connectez-vous à votre espace personnel sur la plateforme ACCEENT Mentoring.",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto">
          <Image
            src="/logo/Logo-violet-AccEent-Mentoring.png"
            width={140}
            height={48}
            alt="ACCEENT Mentoring"
            priority
            className="h-11 w-auto object-contain mx-auto"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Connexion</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Accédez à votre espace personnalisé sur la plateforme
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense
          fallback={
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chargement du formulaire...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </CardContent>

      <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
        <p>
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="text-secondary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
          >
            Inscrivez-vous gratuitement
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
