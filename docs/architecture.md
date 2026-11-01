# Architecture Frontend — Plateforme ACCEENT Mentoring

Ce document décrit l'organisation et les conventions architecturales du projet frontend Next.js (App Router).

## 1. Arborescence Globale

```text
src/
├── app/                              # Routes Next.js (App Router) réparties par groupes de routes
│   ├── (public)/                     # Pages publiques (Accueil, catalogue mentors/opportunités public, CGU...)
│   ├── (auth)/                       # Parcours d'authentification (Connexion, Inscription, Reset password...)
│   ├── (beneficiary)/                # Espace dédié aux mentorés / bénéficiaires
│   ├── (mentor)/                     # Espace dédié aux mentors & experts validés
│   ├── (admin)/                      # Espace d'administration & modération
│   ├── globals.css                   # Feuilles de style globales et variables Tailwind
│   └── layout.tsx                    # Layout racine de l'application
├── components/                       # Composants réutilisables d'interface
│   ├── ui/                           # Composants atomiques (shadcn/ui : Button, Dialog, Input...)
│   ├── layout/                       # En-têtes, pieds de page, sidebars, conteneurs génériques
│   ├── navigation/                   # Menus de navigation, barres latérales, onglets
│   └── shared/                       # Composants partagés transversaux (Cards, Filtres, Modales communes)
├── features/                         # Modules métier autonomes (Feature-based)
│   ├── auth/                         # Formulaires, callbacks et états d'authentification
│   ├── profile/                      # Gestion du profil bénéficiaire
│   ├── mentor-profile/               # Candidature et fiche profil mentor
│   ├── diagnostic/                   # Questionnaire d'évaluation et de besoins
│   ├── matching/                     # Algorithme d'affichage et recommandations mentors
│   ├── mentor-search/                # Moteur de recherche et filtres de mentors
│   ├── mentoring-requests/           # Demandes d'accompagnement (envoi, acceptation, refus)
│   ├── mentoring-journey/            # Feuille de route, jalons, objectifs et tâches
│   ├── sessions/                     # Agenda, disponibilités, réservation de créneaux
│   ├── messaging/                    # Fil de discussion et messagerie instantanée
│   ├── masterclasses/                # Catalogue, inscription et suivi des masterclasses
│   ├── opportunities/                # Hub d'offres (emplois, stages, bourses, concours)
│   ├── notifications/                # Centre de notifications applicatives
│   ├── beneficiary-dashboard/        # Vue synthétique pour le bénéficiaire
│   ├── mentor-dashboard/             # Tableau de bord de suivi mentor
│   └── administration/               # Gestion des utilisateurs, validation mentors, statistiques
├── lib/                              # Services, clients et utilitaires techniques
│   ├── api/                          # Client API backend NestJS, fetchers centralisés et gestion d'erreurs
│   ├── auth/                         # Helpers d'authentification et gestion de rôles
│   ├── supabase/                     # Clients Supabase (browser client, server client SSR, middleware)
│   ├── validations/                  # Schémas de validation Zod réutilisables
│   └── utils.ts                      # Utilitaires génériques (cn, formatage date/monnaie, etc.)
├── hooks/                            # Custom React Hooks globaux
├── types/                            # Types et interfaces TypeScript (DTOs API, modèles métier, enums)
└── config/                           # Constantes d'application, routes, métadonnées, navigation
```

## 2. Principes & Conventions

- **Server First** : Par défaut, les pages et layouts sont des Server Components. `'use client'` est réservé aux composants interactifs (formulaires, hooks d'état, manipulations du DOM).
- **Isolation métier** : Chaque module dans `features/` regroupe ses composants spécifiques, ses hooks locaux et ses sous-types s'ils ne sont pas globaux.
- **Contrat API Swagger** : Toutes les requêtes vers l'API backend passent par la couche `src/lib/api` avec des types définis dans `src/types/`.
- **Authentification & Rôles** : Supabase Auth gère l'identité et la session via `@supabase/ssr`. Le contrôle d'accès dans l'UI dépend des rôles retournés par l'API backend (`bénéficiaire`, `mentor`, `expert`, `partenaire`, `admin`).

