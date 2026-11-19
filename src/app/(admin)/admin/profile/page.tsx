import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { UserProfileEditor } from "@/features/profiles";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mon Profil Administrateur | Administration ACCEENT Mentoring",
  description: "Consultez, modifiez et complétez votre profil administrateur sans quitter la console.",
};

export default async function AdminProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Mon Profil Administrateur
        </h1>
        <p className="text-sm text-muted-foreground">
          Consultez, modifiez et complétez vos informations personnelles depuis votre console.
        </p>
      </div>

      <UserProfileEditor initialProfile={profile} />
    </div>
  );
}
