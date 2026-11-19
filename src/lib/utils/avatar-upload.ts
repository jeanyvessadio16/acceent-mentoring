export const PROFILE_AVATAR_BUCKET = "plateforme-images";
export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export type AllowedProfilePhotoMime = (typeof ALLOWED_PROFILE_PHOTO_MIME_TYPES)[number];

export interface DetectedImageType {
  mimeType: AllowedProfilePhotoMime;
  ext: "jpg" | "png";
}

export type PhotoValidationResult =
  | {
      valid: true;
      mimeType: AllowedProfilePhotoMime;
      ext: "jpg" | "png";
    }
  | {
      valid: false;
      error: string;
    };

/**
 * Détecte le type réel d'une image à partir de sa signature binaire (magic bytes).
 * Supporte JPEG (FF D8 FF) et PNG (89 50 4E 47 0D 0A 1A 0A).
 */
export function detectImageTypeFromBytes(bytes: Uint8Array): DetectedImageType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { mimeType: "image/jpeg", ext: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", ext: "png" };
  }

  return null;
}

/**
 * Valide la taille et le format réel d'une photo de profil avant envoi vers Supabase Storage.
 */
export function validateProfilePhotoBuffer(
  size: number,
  bytes: Uint8Array
): PhotoValidationResult {
  if (!Number.isFinite(size) || size <= 0 || bytes.length === 0) {
    return {
      valid: false,
      error: "Le fichier sélectionné est vide.",
    };
  }

  if (size > MAX_PROFILE_PHOTO_BYTES || bytes.length > MAX_PROFILE_PHOTO_BYTES) {
    return {
      valid: false,
      error: "La photo ne doit pas dépasser 5 Mo.",
    };
  }

  const detected = detectImageTypeFromBytes(bytes);
  if (!detected) {
    return {
      valid: false,
      error: "Format non supporté. Veuillez choisir une image JPG ou PNG.",
    };
  }

  return {
    valid: true,
    mimeType: detected.mimeType,
    ext: detected.ext,
  };
}

/**
 * Construit le chemin de stockage unique dans le dossier de l'utilisateur.
 * L'horodatage évite les caches navigateur/CDN obsolètes lors du remplacement.
 */
export function buildAvatarStoragePath(
  userId: string,
  ext: "jpg" | "png",
  timestamp = Date.now()
): string {
  return `avatars/${userId}/avatar-${timestamp}.${ext}`;
}

/**
 * Extrait le chemin relatif dans `plateforme-images` uniquement si l'URL appartient
 * au dossier d'avatars de l'utilisateur donné (`avatars/<userId>/...`).
 */
export function extractOwnedAvatarStoragePath(
  publicUrl: string | null | undefined,
  supabaseUrl: string,
  userId: string
): string | null {
  if (!publicUrl || !supabaseUrl || !userId) {
    return null;
  }

  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  const expectedPrefix = `${baseUrl}/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`;

  if (!publicUrl.startsWith(expectedPrefix)) {
    return null;
  }

  const rawRelative = publicUrl.slice(expectedPrefix.length).split("?")[0];
  let decodedRelative: string;
  try {
    decodedRelative = decodeURIComponent(rawRelative);
  } catch {
    return null;
  }

  if (
    !decodedRelative ||
    decodedRelative.includes("..") ||
    decodedRelative.includes("\\")
  ) {
    return null;
  }

  const expectedOwnerPrefix = `avatars/${userId}/`;
  if (!decodedRelative.startsWith(expectedOwnerPrefix)) {
    return null;
  }

  const fileName = decodedRelative.slice(expectedOwnerPrefix.length);
  if (!fileName || fileName.includes("/")) {
    return null;
  }

  return decodedRelative;
}
