import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const {
  mockChangePasswordAction,
  mockSignOutAction,
  mockUpdateAccountPrivacyAction,
  mockDeleteMyAccountAction,
  mockPush,
  mockRefresh,
} = vi.hoisted(() => ({
  mockChangePasswordAction: vi.fn(),
  mockSignOutAction: vi.fn(),
  mockUpdateAccountPrivacyAction: vi.fn(),
  mockDeleteMyAccountAction: vi.fn(),
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/actions/auth", () => ({
  changePasswordAction: mockChangePasswordAction,
  signOutAction: mockSignOutAction,
}));

vi.mock("@/lib/actions/profile", () => ({
  updateAccountPrivacyAction: mockUpdateAccountPrivacyAction,
  deleteMyAccountAction: mockDeleteMyAccountAction,
}));

import { UserSettingsPanel } from "./UserSettingsPanel";
import type { UserFullProfile } from "@/lib/actions/profile";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const SAMPLE_PROFILE: UserFullProfile = {
  id: "u-1",
  supabaseUid: "sb-1",
  email: "aminata@example.com",
  prenom: "Aminata",
  nom: "Diop",
  telephone: "+221770000000",
  pays: "Sénégal",
  role: "BENEFICIAIRE",
  statutCompte: "ACTIVE",
  age: 26,
  sexe: "FEMME",
  milieuResidence: "URBAIN",
  situationHandicap: false,
  langue: "fr",
  createdAt: "2026-01-15T10:00:00.000Z",
  photoUrl: null,
  ville: "Dakar",
  localisation: null,
  niveauEtude: "Master",
  secteurActivite: "Numérique",
  anneesExperience: 2,
  competences: [],
  centresInteret: [],
  objectifs: [],
  langues: ["Français"],
  disponibilite: "Soirs",
  isPublic: true,
  mentorProfile: null,
  completionScore: 80,
  missingFields: [],
};

describe("UserSettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("met à jour le thème (Clair / Sombre / Système) dans localStorage et sur le DOM", () => {
    render(
      <UserSettingsPanel
        profile={SAMPLE_PROFILE}
        isPublic={true}
        onPrivacyChange={vi.fn()}
        isMentorOrExpert={false}
        mentorAvailable={true}
        isTogglingAvailability={false}
        onToggleMentorAvailability={vi.fn()}
      />
    );

    const darkButton = screen.getByRole("button", { name: /sombre/i });
    fireEvent.click(darkButton);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    const systemButton = screen.getByRole("button", { name: /système/i });
    fireEvent.click(systemButton);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("soumet le changement de mot de passe et affiche le message de succès", async () => {
    mockChangePasswordAction.mockResolvedValue({
      success: true,
      message: "Mot de passe modifié !",
    });

    render(
      <UserSettingsPanel
        profile={SAMPLE_PROFILE}
        isPublic={true}
        onPrivacyChange={vi.fn()}
        isMentorOrExpert={false}
        mentorAvailable={true}
        isTogglingAvailability={false}
        onToggleMentorAvailability={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/^nouveau mot de passe$/i), {
      target: { value: "NouveauMotDePasse123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirmer le mot de passe$/i), {
      target: { value: "NouveauMotDePasse123!" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /mettre à jour le mot de passe/i })
    );

    await waitFor(() => {
      expect(mockChangePasswordAction).toHaveBeenCalledWith({
        newPassword: "NouveauMotDePasse123!",
        confirmPassword: "NouveauMotDePasse123!",
      });
    });

    expect(await screen.findByText("Mot de passe modifié !")).toBeTruthy();
  });

  it("bascule la confidentialité via updateAccountPrivacyAction", async () => {
    const onPrivacyChange = vi.fn();
    mockUpdateAccountPrivacyAction.mockResolvedValue({
      success: true,
      isPublic: false,
      message: "Votre profil est désormais privé.",
    });

    render(
      <UserSettingsPanel
        profile={SAMPLE_PROFILE}
        isPublic={true}
        onPrivacyChange={onPrivacyChange}
        isMentorOrExpert={false}
        mentorAvailable={true}
        isTogglingAvailability={false}
        onToggleMentorAvailability={vi.fn()}
      />
    );

    const privacySwitch = screen.getByRole("switch");
    fireEvent.click(privacySwitch);

    await waitFor(() => {
      expect(mockUpdateAccountPrivacyAction).toHaveBeenCalledWith(false);
    });

    expect(onPrivacyChange).toHaveBeenCalledWith(false);
    expect(
      await screen.findByText("Votre profil est désormais privé.")
    ).toBeTruthy();
  });
});
