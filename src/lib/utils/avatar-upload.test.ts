import { describe, it, expect } from "vitest";
import {
  PROFILE_AVATAR_BUCKET,
  MAX_PROFILE_PHOTO_BYTES,
  detectImageTypeFromBytes,
  validateProfilePhotoBuffer,
  buildAvatarStoragePath,
  extractOwnedAvatarStoragePath,
} from "./avatar-upload";

describe("detectImageTypeFromBytes", () => {
  it("reconnaît une signature JPEG valide", () => {
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(detectImageTypeFromBytes(jpegBytes)).toEqual({
      mimeType: "image/jpeg",
      ext: "jpg",
    });
  });

  it("reconnaît une signature PNG valide", () => {
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    expect(detectImageTypeFromBytes(pngBytes)).toEqual({
      mimeType: "image/png",
      ext: "png",
    });
  });

  it("rejette les formats non image (PDF, texte, WebP, GIF, buffer trop court)", () => {
    const pdfBytes = new TextEncoder().encode("%PDF-1.4");
    const textBytes = new TextEncoder().encode("hello world");
    const gifBytes = new TextEncoder().encode("GIF89a");
    const webpBytes = new TextEncoder().encode("RIFFxxxxWEBP");
    const shortBytes = new Uint8Array([0xff, 0xd8]);

    expect(detectImageTypeFromBytes(pdfBytes)).toBeNull();
    expect(detectImageTypeFromBytes(textBytes)).toBeNull();
    expect(detectImageTypeFromBytes(gifBytes)).toBeNull();
    expect(detectImageTypeFromBytes(webpBytes)).toBeNull();
    expect(detectImageTypeFromBytes(shortBytes)).toBeNull();
  });
});

describe("validateProfilePhotoBuffer", () => {
  const validPng = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ]);
  const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);

  it("valide une image JPEG ou PNG conforme", () => {
    expect(validateProfilePhotoBuffer(validJpeg.length, validJpeg)).toEqual({
      valid: true,
      mimeType: "image/jpeg",
      ext: "jpg",
    });
    expect(validateProfilePhotoBuffer(validPng.length, validPng)).toEqual({
      valid: true,
      mimeType: "image/png",
      ext: "png",
    });
  });

  it("rejette un fichier vide", () => {
    const res = validateProfilePhotoBuffer(0, new Uint8Array([]));
    expect(res.valid).toBe(false);
  });

  it("rejette un fichier dépassant 5 Mo", () => {
    const res = validateProfilePhotoBuffer(MAX_PROFILE_PHOTO_BYTES + 1, validPng);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain("5 Mo");
    }
  });

  it("rejette un contenu dont la signature binaire est invalide", () => {
    const fakePng = new TextEncoder().encode("not-an-image");
    const res = validateProfilePhotoBuffer(fakePng.length, fakePng);
    expect(res.valid).toBe(false);
  });
});

describe("buildAvatarStoragePath & extractOwnedAvatarStoragePath", () => {
  const supabaseUrl = "https://example.supabase.co";
  const userId = "82b24e43-d0cf-413b-80b7-f9099c1529ab";

  it("construit un chemin normalisé sous avatars/<userId>/avatar-<timestamp>.<ext>", () => {
    expect(buildAvatarStoragePath(userId, "png", 1700000000000)).toBe(
      `avatars/${userId}/avatar-1700000000000.png`
    );
  });

  it("extrait le chemin si l'URL publique appartient au bon utilisateur", () => {
    const url = `${supabaseUrl}/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/avatars/${userId}/avatar-123.jpg`;
    expect(extractOwnedAvatarStoragePath(url, supabaseUrl, userId)).toBe(
      `avatars/${userId}/avatar-123.jpg`
    );
  });

  it("rejette les URL externes, d'un autre utilisateur ou avec traversée de chemin", () => {
    const externalUrl = "https://example.com/avatar.jpg";
    const otherUserUrl = `${supabaseUrl}/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/avatars/autre-user/avatar-123.jpg`;
    const traversalUrl = `${supabaseUrl}/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/avatars/${userId}/../secret.png`;

    expect(extractOwnedAvatarStoragePath(externalUrl, supabaseUrl, userId)).toBeNull();
    expect(extractOwnedAvatarStoragePath(otherUserUrl, supabaseUrl, userId)).toBeNull();
    expect(extractOwnedAvatarStoragePath(traversalUrl, supabaseUrl, userId)).toBeNull();
    expect(extractOwnedAvatarStoragePath(null, supabaseUrl, userId)).toBeNull();
  });
});
