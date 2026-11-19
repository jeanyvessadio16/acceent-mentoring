import { describe, it, expect } from "vitest";
import { profileUpdateSchema } from "./profile";
import { calculateProfileCompletion } from "../utils/profile-completion";

describe("profileUpdateSchema", () => {
  it("valide un profil complet avec succès", () => {
    const validData = {
      firstName: "Fatou",
      lastName: "Diassy",
      phone: "+221 77 123 45 67",
      photoUrl: "https://example.com/avatar.jpg",
      pays: "Sénégal",
      ville: "Dakar",
      localisation: "Plateau",
      age: 23,
      sexe: "FEMME",
      milieuResidence: "RURAL",
      situationHandicap: false,
      niveauEtude: "Licence / Bachelor",
      secteurActivite: "Technologies de l'Information & Digital",
      anneesExperience: 2,
      competences: ["Développement Web", "React", "Next.js"],
      centresInteret: ["Tech", "Entrepreneuriat"],
      objectifs: ["Trouver un premier emploi dans le web"],
      langues: ["Français", "Wolof"],
      disponibilite: "2h par semaine",
      isPublic: true,
    };

    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejette un prénom trop court ou invalide", () => {
    const invalidData = {
      firstName: "F",
      lastName: "Diassy",
      phone: "+221 77 123 45 67",
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejette un âge inférieur à 15 ans", () => {
    const invalidData = {
      firstName: "Fatou",
      lastName: "Diassy",
      phone: "+221 77 123 45 67",
      age: 12,
    };

    const result = profileUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("calculateProfileCompletion", () => {
  it("calcule 0% si toutes les données sont vides", () => {
    const { score, missing } = calculateProfileCompletion({});
    expect(score).toBe(0);
    expect(missing.length).toBeGreaterThan(0);
  });

  it("calcule 100% lorsque tous les champs clés sont remplis", () => {
    const { score, missing } = calculateProfileCompletion({
      prenom: "Fatou",
      nom: "Diassy",
      telephone: "+221 77 123 45 67",
      age: 23,
      sexe: "FEMME",
      milieuResidence: "RURAL",
      ville: "Dakar",
      pays: "Sénégal",
      niveauEtude: "Licence",
      secteurActivite: "Informatique",
      competences: ["React", "TypeScript"],
      objectifs: ["Insertion professionnelle"],
      disponibilite: "2h/semaine",
    });

    expect(score).toBe(100);
    expect(missing.length).toBe(0);
  });
});
