import Link from "next/link";
import Image from "next/image";

import { ROUTES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms";

export const metadata = {
  title: "Créer un compte | ACCEENT Mentoring",
  description: "Rejoignez l'écosystème de mentoring, compétences et opportunités professionnelles.",
};

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-xl lg:max-w-2xl shadow-lg border-border">
      <CardHeader className="text-center space-y-0.5 pb-2 pt-3 px-4 sm:px-6">
        <div className="mx-auto mb-1">
          <Image
            src="/logo/Logo Mentor_plateforme.png"
            width={120}
            height={40}
            alt="Logo MentorPro"
            priority
            className="h-9 w-auto object-contain"
          />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Créer un compte</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Rejoignez l&apos;écosystème de mentoring, compétences et opportunités
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 py-2">
        <RegisterForm />
      </CardContent>

      <CardFooter className="flex flex-col text-center text-xs text-muted-foreground pb-3 pt-1">
        <p>
          Vous avez déjà un compte ?{" "}
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="text-secondary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
          >
            Connectez-vous
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
