import { describe, it, expect } from "vitest";
import {
  MAX_CV_FILE_BYTES,
  isPdfMagicBytes,
  validateCvPdfBuffer,
  buildCvStoragePath,
  formatFileSize,
} from "./cv-upload";

describe("isPdfMagicBytes", () => {
  it("reconnaît les signatures PDF %PDF-1.4 et %PDF-1.7", () => {
    const pdf14 = new TextEncoder().encode("%PDF-1.4\n%%EOF");
    const pdf17 = new TextEncoder().encode("%PDF-1.7\n");

    expect(isPdfMagicBytes(pdf14)).toBe(true);
    expect(isPdfMagicBytes(pdf17)).toBe(true);
  });

  it("rejette PNG, JPEG, texte brut et buffer trop court", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    const plain = new TextEncoder().encode("Mon CV texte");
    const shortPdf = new TextEncoder().encode("%PDF");

    expect(isPdfMagicBytes(png)).toBe(false);
    expect(isPdfMagicBytes(jpeg)).toBe(false);
    expect(isPdfMagicBytes(plain)).toBe(false);
    expect(isPdfMagicBytes(shortPdf)).toBe(false);
  });
});

describe("validateCvPdfBuffer", () => {
  const validPdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");

  it("valide un fichier PDF conforme", () => {
    expect(validateCvPdfBuffer(validPdf.length, validPdf)).toEqual({
      valid: true,
      mimeType: "application/pdf",
      ext: "pdf",
    });
  });

  it("rejette un fichier vide", () => {
    const res = validateCvPdfBuffer(0, new Uint8Array([]));
    expect(res.valid).toBe(false);
  });

  it("rejette un fichier dépassant 5 Mo", () => {
    const res = validateCvPdfBuffer(MAX_CV_FILE_BYTES + 1, validPdf);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain("5 Mo");
    }
  });

  it("rejette un faux PDF ne commençant pas par %PDF-", () => {
    const fakePdf = new TextEncoder().encode("<html>not a pdf</html>");
    const res = validateCvPdfBuffer(fakePdf.length, fakePdf);
    expect(res.valid).toBe(false);
  });
});

describe("buildCvStoragePath & formatFileSize", () => {
  it("construit un chemin normalisé sous cvs/<userId>/cv-<timestamp>.pdf", () => {
    expect(buildCvStoragePath("user-123", 1700000000000)).toBe(
      "cvs/user-123/cv-1700000000000.pdf"
    );
  });

  it("formate correctement les tailles en o, Ko et Mo", () => {
    expect(formatFileSize(512)).toBe("512 o");
    expect(formatFileSize(15360)).toBe("15 Ko");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2,0 Mo");
  });
});
