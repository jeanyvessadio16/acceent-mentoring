export const CV_STORAGE_BUCKET = "mentor-documents";
export const MAX_CV_FILE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_CV_MIME_TYPES = ["application/pdf"] as const;

export type CvValidationResult =
  | {
      valid: true;
      mimeType: "application/pdf";
      ext: "pdf";
    }
  | {
      valid: false;
      error: string;
    };

/**
 * Vérifie que les octets commencent bien par la signature PDF `%PDF-`.
 */
export function isPdfMagicBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}

/**
 * Valide la taille et le format PDF réel d'un CV avant envoi vers Supabase Storage.
 */
export function validateCvPdfBuffer(
  size: number,
  bytes: Uint8Array
): CvValidationResult {
  if (!Number.isFinite(size) || size <= 0 || bytes.length === 0) {
    return {
      valid: false,
      error: "Le fichier CV sélectionné est vide.",
    };
  }

  if (size > MAX_CV_FILE_BYTES || bytes.length > MAX_CV_FILE_BYTES) {
    return {
      valid: false,
      error: "Le fichier CV ne doit pas dépasser 5 Mo.",
    };
  }

  if (!isPdfMagicBytes(bytes)) {
    return {
      valid: false,
      error: "Format non supporté. Veuillez téléverser votre CV au format PDF uniquement.",
    };
  }

  return {
    valid: true,
    mimeType: "application/pdf",
    ext: "pdf",
  };
}

/**
 * Construit le chemin de stockage unique du CV dans le dossier dédié à l'utilisateur.
 */
export function buildCvStoragePath(
  userId: string,
  timestamp = Date.now()
): string {
  return `cvs/${userId}/cv-${timestamp}.pdf`;
}

/**
 * Formate lisiblement la taille d'un fichier en octets / Ko / Mo.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 o";
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} o`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
  return `${mb} Mo`;
}
