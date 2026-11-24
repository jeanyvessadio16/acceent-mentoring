"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
} from "lucide-react";
import { changePasswordAction, signOutAction } from "@/lib/actions/auth";
import {
  deleteMyAccountAction,
  updateAccountPrivacyAction,
  type UserFullProfile,
} from "@/lib/actions/profile";
import { ROUTES } from "@/lib/constants";
import {
  readStoredThemePreference,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";

interface UserSettingsPanelProps {
  profile: UserFullProfile;
  isPublic: boolean;
  onPrivacyChange: (nextIsPublic: boolean) => void;
  isMentorOrExpert: boolean;
  mentorAvailable: boolean;
  isTogglingAvailability: boolean;
  onToggleMentorAvailability: () => Promise<void> | void;
}

function getServerThemePreference(): ThemePreference {
  return "light";
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  BENEFICIAIRE: "Bénéficiaire",
  MENTOR: "Mentor",
  EXPERT: "Expert",
  PARTENAIRE: "Partenaire",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  PENDING: "En attente de validation",
  SUSPENDED: "Suspendu",
  REJECTED: "Refusé",
};

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Clair",
    description: "Interface lumineuse par défaut",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Confort visuel en faible luminosité",
    icon: Moon,
  },
  {
    value: "system",
    label: "Système",
    description: "Suit les préférences de votre appareil",
    icon: Monitor,
  },
];

export function UserSettingsPanel({
  profile,
  isPublic,
  onPrivacyChange,
  isMentorOrExpert,
  mentorAvailable,
  isTogglingAvailability,
  onToggleMentorAvailability,
}: UserSettingsPanelProps) {
  const router = useRouter();
  const themePreference = useSyncExternalStore(
    subscribeTheme,
    readStoredThemePreference,
    getServerThemePreference
  );

  // Mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Confidentialité
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Session
  const [isSigningOut, setIsSigningOut] = useState(false);

  // RGPD Suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formattedCreatedAt = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Non renseignée";

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordFeedback(null);
    setIsUpdatingPassword(true);

    try {
      const result = await changePasswordAction({
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setNewPassword("");
        setConfirmPassword("");
        setPasswordFeedback({
          type: "success",
          message:
            result.message || "Votre mot de passe a été mis à jour avec succès.",
        });
      } else {
        setPasswordFeedback({
          type: "error",
          message:
            result.error ||
            "Impossible de mettre à jour votre mot de passe.",
        });
      }
    } catch {
      setPasswordFeedback({
        type: "error",
        message: "Une erreur réseau est survenue lors du changement de mot de passe.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTogglePrivacy = async () => {
    const nextValue = !isPublic;
    setPrivacyFeedback(null);
    setIsUpdatingPrivacy(true);

    try {
      const result = await updateAccountPrivacyAction(nextValue);
      if (result.success) {
        onPrivacyChange(result.isPublic ?? nextValue);
        setPrivacyFeedback({
          type: "success",
          message: result.message,
        });
        router.refresh();
      } else {
        setPrivacyFeedback({
          type: "error",
          message: result.message,
        });
      }
    } catch {
      setPrivacyFeedback({
        type: "error",
        message: "Erreur lors de la mise à jour de votre confidentialité.",
      });
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutAction();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "SUPPRIMER") {
      setDeleteError("Veuillez saisir SUPPRIMER pour confirmer la suppression.");
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      const res = await deleteMyAccountAction();
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setDeleteError(res.message);
      }
    } catch {
      setDeleteError(
        "Une erreur est survenue lors de la suppression du compte."
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* 1. APPARENCE & THÈME */}
      <section className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Apparence &amp; Thème
          </h3>
          <p className="text-xs text-muted-foreground">
            Choisissez le thème d&apos;affichage appliqué à vos tableaux de bord.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = themePreference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setThemePreference(option.value)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-xs"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block">
                    {option.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SÉCURITÉ & MOT DE PASSE */}
      <section className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Sécurité &amp; Mot de passe
            </h3>
            <p className="text-xs text-muted-foreground">
              Modifiez votre mot de passe à tout moment tout en conservant votre session active.
            </p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
              passwordFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {passwordFeedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{passwordFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label
                htmlFor="settings-new-password"
                className="font-semibold text-foreground block mb-1.5"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="settings-new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="8 caractères minimum"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword
                      ? "Masquer le nouveau mot de passe"
                      : "Afficher le nouveau mot de passe"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="settings-confirm-password"
                className="font-semibold text-foreground block mb-1.5"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="settings-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="Répétez le nouveau mot de passe"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground">
              Exigences : au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.
            </p>
            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="rounded-xl text-xs font-semibold h-10 px-5 shrink-0"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* 3. CONFIDENTIALITÉ & VISIBILITÉ */}
      <section className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Confidentialité &amp; Visibilité
          </h3>
          <p className="text-xs text-muted-foreground">
            Contrôlez la visibilité de votre profil dans la communauté ACCEENT.
          </p>
        </div>

        {privacyFeedback && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
              privacyFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {privacyFeedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{privacyFeedback.message}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Profil visible dans la communauté (F02)
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {isPublic
                ? "Votre profil public peut être consulté par les membres autorisés."
                : "Votre profil est masqué des consultations publiques."}
            </span>
            {isPublic && (
              <Link
                href={ROUTES.PUBLIC_USER_PROFILE(profile.id)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-1"
              >
                <span>Aperçu de mon profil public</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          <Button
            type="button"
            variant={isPublic ? "default" : "outline"}
            size="sm"
            role="switch"
            aria-checked={isPublic}
            disabled={isUpdatingPrivacy}
            onClick={() => void handleTogglePrivacy()}
            className="rounded-xl text-xs font-semibold h-9 px-4 shrink-0"
          >
            {isUpdatingPrivacy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            <span>{isPublic ? "Public" : "Privé"}</span>
          </Button>
        </div>

        {isMentorOrExpert && (
          <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Award className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Disponibilité Mentorat (F03)
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {mentorAvailable
                    ? "Vous êtes visible dans le catalogue pour recevoir de nouvelles demandes."
                    : "Votre disponibilité est suspendue temporairement."}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant={mentorAvailable ? "outline" : "default"}
              size="sm"
              disabled={isTogglingAvailability}
              onClick={() => void onToggleMentorAvailability()}
              className="rounded-xl text-xs font-semibold h-9 px-4 shrink-0"
            >
              {isTogglingAvailability ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : null}
              <span>
                {mentorAvailable
                  ? "Suspendre ma disponibilité"
                  : "Réactiver ma disponibilité"}
              </span>
            </Button>
          </div>
        )}
      </section>

      {/* 4. INFORMATIONS DU COMPTE & SESSION */}
      <section className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-secondary/10 text-secondary shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Informations du compte &amp; Session
            </h3>
            <p className="text-xs text-muted-foreground">
              Détails généraux associés à votre identifiant ACCEENT.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border">
            <dt className="text-[11px] text-muted-foreground">Adresse e-mail</dt>
            <dd className="font-semibold text-foreground mt-0.5 truncate">
              {profile.email}
            </dd>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border">
            <dt className="text-[11px] text-muted-foreground">Rôle</dt>
            <dd className="font-semibold text-foreground mt-0.5">
              {ROLE_LABELS[profile.role] || profile.role}
            </dd>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border">
            <dt className="text-[11px] text-muted-foreground">Statut du compte</dt>
            <dd className="font-semibold text-foreground mt-0.5">
              {ACCOUNT_STATUS_LABELS[profile.statutCompte] || profile.statutCompte}
            </dd>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border">
            <dt className="text-[11px] text-muted-foreground">Membre depuis</dt>
            <dd className="font-semibold text-foreground mt-0.5">
              {formattedCreatedAt}
            </dd>
          </div>
        </dl>

        <div className="pt-1 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            className="rounded-xl text-xs font-semibold h-9 px-4 gap-1.5"
          >
            {isSigningOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>Se déconnecter</span>
          </Button>
        </div>
      </section>

      {/* 5. DROITS RGPD & ZONE DE DANGER */}
      <section className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Mes droits RGPD &amp; Données personnelles
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Conformément au RGPD, vous pouvez exporter l&apos;ensemble de vos données au format JSON ou supprimer définitivement votre compte.
        </p>

        {deleteError && (
          <div className="p-3 rounded-2xl text-xs flex items-center gap-2 border bg-red-50 text-red-900 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-semibold">{deleteError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/exports/users/me/export"
            download="acceent-mes-donnees-rgpd.json"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Télécharger mes données (JSON)</span>
          </a>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm((prev) => !prev)}
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 px-3"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Supprimer mon compte
          </Button>
        </div>

        {showDeleteConfirm && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
            <p className="text-xs font-semibold text-destructive">
              Action irréversible : toutes vos données, demandes, parcours et messages seront supprimés.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Saisissez SUPPRIMER pour confirmer"
                className="flex-1 px-3 py-2 rounded-xl border border-destructive/30 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-destructive/20"
              />
              <Button
                type="button"
                disabled={
                  isDeletingAccount ||
                  deleteConfirmText.trim().toUpperCase() !== "SUPPRIMER"
                }
                onClick={() => void handleDeleteAccount()}
                className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold rounded-xl h-9 px-4"
              >
                {isDeletingAccount ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                Confirmer la suppression
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
