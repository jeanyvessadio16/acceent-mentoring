import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { UserProfileEditor } from "@/features/profiles";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Mon Profil Mentor | ACCEENT Mentoring",
  description: "Accédez, modifiez et complétez votre profil mentor et vos expertises sans quitter votre espace.",
};

export default async function MentorProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Mon Profil Mentor
        </h1>
        <p className="text-sm text-muted-foreground">
          Complétez votre biographie, votre fonction et vos domaines d&apos;expertise pour accompagner les bénéficiaires.
        </p>
      </div>

      <UserProfileEditor initialProfile={profile} />
    </div>
  );
}
