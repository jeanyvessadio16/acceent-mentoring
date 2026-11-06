import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface LogoProps {
  /**
   * 'full': logo horizontal complet ACCEENT (texte + emblème)
   * 'icon': emblème carré ACCEENT
   */
  variant?: 'full' | 'icon';
  /**
   * Couleur du logo :
   * - 'dark' (par défaut) : #0F172A (bleu nuit profond / foncé) pour fond blanc ou clair
   * - 'brand' : #6D4C6C (couleur violette officielle ACCEENT)
   * - 'white' : #FFFFFF pour les fonds sombres
   */
  color?: 'dark' | 'brand' | 'white';
  /**
   * Taille prédéfinie
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Classes Tailwind personnalisées
   */
  className?: string;
  /**
   * Chargement prioritaire Next.js (LCP)
   */
  priority?: boolean;
}

export function Logo({
  variant = 'full',
  color = 'dark',
  size = 'md',
  className,
  priority = false,
}: LogoProps) {
  if (variant === 'icon') {
    const iconDimensions: Record<
      NonNullable<LogoProps['size']>,
      { width: number; height: number; defaultClass: string }
    > = {
      sm: { width: 32, height: 32, defaultClass: 'h-8 w-8' },
      md: { width: 40, height: 40, defaultClass: 'h-10 w-10' },
      lg: { width: 52, height: 52, defaultClass: 'h-13 w-13' },
      xl: { width: 64, height: 64, defaultClass: 'h-16 w-16' },
    };

    const dim = iconDimensions[size];

    return (
      <Image
        src="/logo/logoACCEENT.png"
        alt="Logo ACCEENT"
        width={dim.width}
        height={dim.height}
        priority={priority}
        className={cn('object-contain shrink-0', dim.defaultClass, className)}
      />
    );
  }

  // Ratio du logo horizontal logo-acceent.png : 3163 x 884 (~3.58 : 1)
  const fullDimensions: Record<
    NonNullable<LogoProps['size']>,
    { width: number; height: number; defaultClass: string }
  > = {
    sm: { width: 114, height: 32, defaultClass: 'h-7 w-auto' },
    md: { width: 143, height: 40, defaultClass: 'h-9 w-auto' },
    lg: { width: 172, height: 48, defaultClass: 'h-11 w-auto' },
    xl: { width: 215, height: 60, defaultClass: 'h-14 w-auto' },
  };

  const dim = fullDimensions[size];

  // Par défaut sur fond clair, utiliser la version sombre #0F172A
  const logoSrc =
    color === 'white'
      ? '/logo/logo-acceent.png'
      : color === 'brand'
      ? '/logo/logo-acceent-brand.png'
      : '/logo/logo-acceent-dark.png';

  return (
    <Image
      src={logoSrc}
      alt="ACCEENT"
      width={dim.width}
      height={dim.height}
      priority={priority}
      className={cn('object-contain shrink-0', dim.defaultClass, className)}
    />
  );
}
