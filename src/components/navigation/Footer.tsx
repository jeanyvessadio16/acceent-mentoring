import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";

const FOOTER_LINKS = {
  Plateforme: [
    { label: "Découvrir les mentors", href: ROUTES.MENTORS_CATALOG },
    { label: "Opportunités", href: ROUTES.OPPORTUNITIES_CATALOG },
    { label: "Masterclasses", href: ROUTES.MASTERCLASSES_CATALOG },
  ],
  "Rejoindre": [
    { label: "S'inscrire", href: ROUTES.AUTH.REGISTER },
    { label: "Devenir mentor", href: `${ROUTES.AUTH.REGISTER}?role=mentor` },
    { label: "Se connecter", href: ROUTES.AUTH.LOGIN },
  ],
  "Légal": [
    { label: "Conditions Générales (CGU)", href: ROUTES.LEGAL.CGU },
    { label: "Données personnelles", href: ROUTES.LEGAL.PRIVACY },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/Logo Mentor_plateforme.png"
                alt="ACCEENT Mentoring — Apprendre · Évoluer · Réussir"
                width={160}
                height={55}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Plateforme d&apos;accompagnement qui met en relation jeunes, femmes, professionnels
              et entrepreneurs avec des mentors et des experts pour accélérer leurs parcours.
            </p>
          </div>

          {/* Liens */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-white mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 ACCEENT Mentoring. Tous droits réservés.</p>
          <p>Sénégal & Afrique de l&apos;Ouest</p>
        </div>
      </div>
    </footer>
  );
}
