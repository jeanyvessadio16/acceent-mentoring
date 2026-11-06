'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-brand-surface py-12 text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Marque */}
          <div className="space-y-3">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo variant="full" size="md" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plateforme panafricaine de mentoring, de développement des compétences, d'opportunités et de progression de carrière.
            </p>
            <p className="text-xs text-muted-foreground">
              Dakar, Sénégal & Afrique de l'Ouest
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/mentors" className="hover:text-brand-primary transition-colors">
                  Trouver un mentor
                </Link>
              </li>
              <li>
                <Link href="/opportunites" className="hover:text-brand-primary transition-colors">
                  Opportunity Hub
                </Link>
              </li>
              <li>
                <Link href="/masterclasses" className="hover:text-brand-primary transition-colors">
                  Masterclasses & Ateliers
                </Link>
              </li>
              <li>
                <Link href="/diagnostic" className="hover:text-brand-primary transition-colors">
                  Diagnostic de compétences
                </Link>
              </li>
            </ul>
          </div>

          {/* Rôles & Espaces */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Programmes</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/devenir-mentor" className="hover:text-brand-primary transition-colors">
                  Devenir Mentor / Expert
                </Link>
              </li>
              <li>
                <Link href="/beneficiary/dashboard" className="hover:text-brand-primary transition-colors">
                  Espace Mentoré
                </Link>
              </li>
              <li>
                <Link href="/mentor/dashboard" className="hover:text-brand-primary transition-colors">
                  Espace Mentor
                </Link>
              </li>
            </ul>
          </div>

          {/* Mentions Légales */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Légal & Confidentialité</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cgu" className="hover:text-brand-primary transition-colors">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-brand-primary transition-colors">
                  Protection des données (RGPD / CDP)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-primary transition-colors">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>© 2026 ACCEENT Mentoring. Tous droits réservés.</p>
          <p>Conçu pour l'autonomisation et l'excellence professionnelle.</p>
        </div>
      </div>
    </footer>
  );
}

