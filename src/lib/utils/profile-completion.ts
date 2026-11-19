/**
 * Calcule le taux de complétion d'un profil (0 à 100%)
 * et liste les champs prioritaires manquants pour guider l'utilisateur.
 */
export function calculateProfileCompletion(data: {
  prenom?: string | null;
  nom?: string | null;
  telephone?: string | null;
  age?: number | null;
  sexe?: string | null;
  milieuResidence?: string | null;
  ville?: string | null;
  pays?: string | null;
  niveauEtude?: string | null;
  secteurActivite?: string | null;
  competences?: string[] | null;
  objectifs?: string[] | null;
  disponibilite?: string | null;
}): { score: number; missing: string[] } {
  let score = 0;
  const missing: string[] = [];

  // 1. Nom & Prénom (15%)
  if (data.prenom && data.nom) {
    score += 15;
  } else {
    missing.push("Nom et Prénom");
  }

  // 2. Téléphone (10%)
  if (data.telephone && data.telephone.trim().length >= 8) {
    score += 10;
  } else {
    missing.push("Numéro de téléphone");
  }

  // 3. Âge et Sexe (10%)
  if (data.age && data.sexe) {
    score += 10;
  } else {
    missing.push("Âge et Sexe");
  }

  // 4. Milieu de résidence (10%)
  if (data.milieuResidence) {
    score += 10;
  } else {
    missing.push("Milieu de résidence (Rural / Urbain)");
  }

  // 5. Ville et Pays (10%)
  if (data.ville && data.ville.trim().length > 0) {
    score += 10;
  } else {
    missing.push("Ville de résidence");
  }

  // 6. Niveau d'études (15%)
  if (data.niveauEtude && data.niveauEtude.trim().length > 0) {
    score += 15;
  } else {
    missing.push("Niveau d'études");
  }

  // 7. Secteur d'activité (10%)
  if (data.secteurActivite && data.secteurActivite.trim().length > 0) {
    score += 10;
  } else {
    missing.push("Secteur d'activité");
  }

  // 8. Compétences clés (10%)
  if (data.competences && data.competences.length >= 1) {
    score += 10;
  } else {
    missing.push("Compétences clés (au moins 1)");
  }

  // 9. Objectifs prioritaires (10%)
  if (data.objectifs && data.objectifs.length >= 1) {
    score += 10;
  } else {
    missing.push("Objectifs de mentorat");
  }

  return {
    score: Math.min(100, score),
    missing,
  };
}
