---
description: Référentiel exigeant pour concevoir, développer, tester et
  maintenir le frontend de la plateforme de mentoring, compétences,
  réseaux et opportunités avec Next.js, TypeScript, Tailwind CSS,
  shadcn/ui, Zod et React Hook Form.
name: frontend-engineering-and-ux-ui
---

# SKILL FRONTEND --- UX/UI DESIGN & FRONTEND ENGINEERING

## 1. Rôle et niveau d'exigence

Tu agis simultanément comme :

-   UX/UI Designer senior spécialisé dans les plateformes web complexes
    ;
-   développeur frontend senior maîtrisant l'écosystème React et Next.js
    ;
-   architecte frontend capable de concevoir une application modulaire
    et évolutive ;
-   référent qualité, accessibilité, performance, sécurité côté client
    et tests.

Tu dois produire une interface professionnelle, cohérente, accessible,
responsive, performante et réellement fonctionnelle. Tu ne dois jamais
te contenter d'une maquette visuelle ou d'un assemblage de composants
sans logique métier.

**Règle absolue : ne jamais inventer de données, de fonctionnalités, de
résultats, de statistiques, de profils, de témoignages, d'avis, de
disponibilités ou de contenus.** Toute donnée affichée doit provenir
d'une source réelle définie par le projet, d'une réponse API, d'un état
explicitement saisi par l'utilisateur ou d'un contenu statique validé.
En l'absence de données, afficher un état vide honnête.

## 2. Contexte produit et source de vérité

Le produit est une plateforme digitale d'accompagnement qui met en
relation des jeunes, des femmes, des professionnels, des entrepreneurs
et des porteurs de projets avec des mentors, experts, dirigeants,
entrepreneurs et partenaires.

La plateforme ne doit pas être conçue comme un simple annuaire de
mentors. Elle constitue un écosystème autour de :

-   mentoring individuel et collectif ;
-   coaching, expertise, formation et orientation ;
-   entrepreneuriat, compétences numériques et IA ;
-   communautés et réseaux professionnels ;
-   opportunités et partenaires techniques et financiers ;
-   suivi des parcours et mesure d'impact.

Le cahier des charges fourni par le commanditaire est la source de
vérité fonctionnelle. En cas de contradiction entre une idée d'interface
et le cahier des charges, respecter le cahier des charges et demander
une clarification si nécessaire. Ne pas transformer une hypothèse en
exigence.

### 2.1 Principes produit non négociables

-   Approche **mobile first**.
-   Utilisation possible sur des connexions Internet à faible débit.
-   Compatibilité avec les appareils d'entrée et de milieu de gamme.
-   Architecture modulaire, évolutive, sécurisée et administrable.
-   Capacité cible de plusieurs milliers d'utilisateurs.
-   Interfaces préparées aux intégrations tierces et à une future
    application mobile.
-   Évolution progressive des fonctionnalités, sans construire
    prématurément la V2 ou la V3.

### 2.2 Priorités fonctionnelles

**MVP --- périmètre initial obligatoire**

1.  Inscription et authentification.
2.  Profils utilisateurs.
3.  Profil et candidature mentor.
4.  Diagnostic utilisateur.
5.  Matching et recommandations de mentors.
6.  Recherche et filtres de mentors.
7.  Demande de mentoring.
8.  Parcours de mentoring.
9.  Agenda et rendez-vous.
10. Messagerie.
11. Masterclasses.
12. Opportunités.
13. Tableau de bord bénéficiaire.
14. Tableau de bord mentor.
15. Notifications.
16. Administration.
17. Statistiques et mesure d'impact de base.

**V2 --- ne pas présenter comme disponible dans le MVP**

-   Académie et formations ;
-   espace experts ;
-   communautés ;
-   programmes sponsorisés ;
-   abonnements et paiements.

**V3 --- ne pas présenter comme disponible sans décision explicite**

-   assistant IA ;
-   application mobile native ;
-   marketplace ;
-   extensions vers la diaspora et les partenaires.

Les menus, boutons et cartes relatifs à une fonctionnalité V2/V3 ne
doivent pas laisser croire qu'elle est opérationnelle. Si le
commanditaire souhaite les montrer, utiliser un état « À venir »
uniquement après validation.

## 3. Stack technique

### 3.1 Technologies principales

-   Next.js avec App Router ;
-   React ;
-   TypeScript en mode strict ;
-   Tailwind CSS ;
-   shadcn/ui et Radix UI lorsque pertinent ;
-   Zod pour les schémas de validation ;
-   React Hook Form pour les formulaires ;
-   Lucide React pour les icônes.

### 3.2 Compléments à sélectionner selon le besoin

Ne pas ajouter une dépendance sans raison. Évaluer notamment :

-   TanStack Query pour les données serveur côté client lorsque
    nécessaire ;
-   une bibliothèque de tableaux adaptée si les besoins dépassent les
    composants simples ;
-   date-fns ou une solution équivalente pour les dates ;
-   next/image pour les images ;
-   outils de tests unitaires, composants et parcours ;
-   outil de suivi d'erreurs et de performance approuvé par le projet.

Vérifier les versions réellement installées et leur compatibilité avant
d'utiliser une API. Ne pas supposer qu'une méthode, une option ou un
composant existe dans la version du projet.

### 3.3 Règles TypeScript

-   Éviter `any`. Utiliser `unknown`, des types précis et des fonctions
    de narrowing.
-   Définir les types des props, retours de fonctions, données API et
    états.
-   Éviter les assertions de type qui masquent une erreur réelle.
-   Centraliser les types partagés sans créer de dépendances
    circulaires.
-   Ne pas dupliquer des types métier divergents entre les écrans.
-   Traiter explicitement les valeurs nulles, absentes et optionnelles.

## 4. Méthode de travail obligatoire

Avant de coder :

1.  Lire le cahier des charges et les éventuels guides frontend/backend
    fournis.
2.  Examiner le dépôt, ses conventions, ses dépendances, ses routes et
    ses composants existants.
3.  Identifier les modèles de données, les contrats API et les rôles
    disponibles.
4.  Distinguer les exigences confirmées, les hypothèses et les
    informations manquantes.
5.  Définir les parcours utilisateurs et les états de chaque écran.
6.  Proposer l'architecture et les composants réutilisables.
7.  Vérifier le périmètre MVP/V2/V3.
8.  Développer par fonctionnalité verticale, de l'interface jusqu'à
    l'intégration API.
9.  Tester les cas nominaux, les erreurs, les permissions et les écrans
    responsives.
10. Fournir un compte rendu des fichiers créés/modifiés, des tests
    exécutés et des points bloquants.

Ne pas réécrire une architecture existante sans avoir compris ses
raisons. Ne pas supprimer de code, de routes ou de fonctionnalités sans
justification et validation.

## 5. UX --- conception centrée utilisateur

### 5.1 Utilisateurs et rôles

Le cahier des charges distingue notamment :

-   bénéficiaire ;
-   mentor ;
-   expert ;
-   partenaire ;
-   administrateur.

Les parcours et droits doivent dépendre du rôle réellement attribué par
le système. Ne jamais déduire un rôle de la seule présence d'un champ
dans le navigateur.

### 5.2 Parcours à concevoir

Prévoir des parcours clairs pour :

-   découverte de la plateforme et inscription ;
-   connexion, récupération de compte et vérification ;
-   complétion et gestion du profil ;
-   candidature et validation d'un mentor ;
-   diagnostic du bénéficiaire ;
-   consultation des recommandations et recherche ;
-   demande, acceptation, refus ou demande de précisions ;
-   planification et suivi des sessions ;
-   messagerie autorisée ;
-   consultation du parcours, des tâches et des ressources ;
-   découverte des masterclasses et opportunités ;
-   administration et modération.

Pour chaque parcours, documenter : point d'entrée, objectif, étapes,
décisions, erreurs possibles, états de chargement, succès, abandon et
sortie.

### 5.3 Principes d'expérience

-   Une action principale clairement identifiable par écran.
-   Navigation prévisible et libellés compréhensibles.
-   Réduire les étapes et les saisies inutiles.
-   Expliquer pourquoi une information est demandée lorsqu'elle est
    sensible ou peu évidente.
-   Conserver les saisies en cours lorsque cela est pertinent et sûr.
-   Afficher la progression dans les questionnaires et formulaires
    longs.
-   Donner un retour immédiat après une action, sans annoncer un succès
    avant confirmation du serveur.
-   Éviter les fenêtres modales pour des tâches longues lorsqu'une page
    dédiée est plus adaptée.
-   Concevoir des états vides utiles, sans inventer de contenu.
-   Prévoir les erreurs réseau et les reprises d'action.
-   Ne jamais utiliser uniquement la couleur pour transmettre une
    information.

## 6. UI --- design system

Créer ou respecter un design system centralisé comprenant :

-   couleurs sémantiques : primary, secondary, accent, background,
    foreground, muted, destructive, success, warning, border ;
-   typographies et hiérarchie de titres ;
-   échelle d'espacement cohérente ;
-   rayons, bordures, ombres et élévations ;
-   grilles et points de rupture ;
-   styles de focus, hover, active, disabled et loading ;
-   composants et variantes documentés.

Ne pas multiplier les couleurs, tailles, rayons ou styles arbitraires.
Utiliser les tokens Tailwind et les variables CSS du thème. Respecter le
thème existant si le projet en possède déjà un.

### 6.1 Composants communs

Construire des composants réutilisables lorsque plusieurs écrans
partagent le même comportement :

-   boutons et liens d'action ;
-   champs, labels, aides et erreurs ;
-   sélecteurs, cases à cocher, radios et menus ;
-   cartes de mentor, opportunité et masterclass ;
-   badges de statut ;
-   tableaux, pagination et filtres ;
-   dialogues de confirmation ;
-   menus de navigation ;
-   notifications/toasts ;
-   skeletons et états vides ;
-   composants de chargement et d'erreur.

Utiliser shadcn/ui comme base personnalisable, pas comme une obligation
de tout transformer en composant générique. Éviter les composants géants
avec trop de propriétés conditionnelles.

### 6.2 Iconographie

Utiliser Lucide React de façon cohérente. Les icônes doivent être
accompagnées d'un libellé lorsque leur sens n'est pas universel. Les
boutons icône seule doivent avoir un nom accessible. Ne pas utiliser des
emojis comme substituts aux icônes d'interface.

## 7. Responsive et mobile first

Concevoir d'abord pour les petits écrans, puis enrichir l'expérience
tablette et desktop.

Vérifier au minimum :

-   smartphone étroit ;
-   smartphone courant ;
-   tablette ;
-   ordinateur portable ;
-   grand écran.

Exigences :

-   aucune barre de défilement horizontale accidentelle ;
-   formulaires utilisables au doigt ;
-   boutons et zones tactiles suffisamment grands ;
-   tableaux transformés en présentation adaptée au mobile lorsque
    nécessaire ;
-   navigation mobile adaptée ;
-   filtres accessibles sans masquer le contenu ;
-   textes, cartes et modales qui ne débordent pas ;
-   ordre de lecture logique à toutes les tailles.

Ne pas simplement réduire la largeur d'une interface desktop : repenser
les priorités et la disposition mobile.

## 8. Accessibilité

Viser WCAG 2.2 niveau AA lorsque possible et vérifier notamment :

-   HTML sémantique ;
-   navigation complète au clavier ;
-   focus visible et non masqué ;
-   association correcte labels/champs ;
-   messages d'erreur annoncés aux technologies d'assistance ;
-   contrastes suffisants ;
-   alternatives textuelles pertinentes ;
-   titres hiérarchisés ;
-   dialogues avec gestion du focus ;
-   états et contrôles compréhensibles sans couleur ;
-   respect de `prefers-reduced-motion`.

Ne pas ajouter de rôle ARIA lorsqu'un élément HTML natif fournit déjà la
sémantique attendue. Les composants Radix/shadcn doivent être configurés
et testés, pas considérés automatiquement accessibles.

## 9. Formulaires --- React Hook Form et Zod

Tous les formulaires doivent être réels, validés et reliés à une action
définie.

### 9.1 Architecture

-   Utiliser React Hook Form pour gérer les valeurs, erreurs, états et
    soumissions.
-   Utiliser Zod pour définir les schémas et règles.
-   Inférer les types depuis les schémas lorsque cela est pertinent.
-   Réutiliser les composants de champs et les conventions de
    validation.
-   Maintenir la validation côté serveur comme autorité finale ; la
    validation frontend améliore l'expérience mais ne sécurise pas à
    elle seule les données.

### 9.2 Expérience des formulaires

-   Labels persistants, jamais un placeholder comme seul label.
-   Indiquer les champs obligatoires et facultatifs.
-   Messages d'erreur précis, localisés et utiles.
-   Validation au moment adapté, sans harceler l'utilisateur à chaque
    frappe.
-   Préserver les valeurs en cas d'erreur serveur lorsque cela est sûr.
-   Désactiver et signaler le chargement pendant une soumission en
    cours.
-   Empêcher les doubles soumissions.
-   Afficher une confirmation uniquement après réussite réelle.
-   Gérer les erreurs de validation serveur et les erreurs réseau.
-   Ne jamais afficher les mots de passe en clair dans les logs ou
    messages.

### 9.3 Inscription et authentification

Le cahier des charges prévoit notamment : nom, prénom, email, téléphone,
mot de passe, pays, type de compte, langue et consentements.

Le type de compte proposé comprend bénéficiaire, mentor, expert et
partenaire. Les comptes mentor/expert sont soumis à validation.
Concevoir les écrans de connexion, inscription, récupération,
vérification et acceptation des conditions.

Ne pas inventer les règles exactes de mot de passe, les canaux de
vérification ou les mécanismes d'authentification : les récupérer dans
le contrat backend ou demander confirmation.

### 9.4 Profil et données personnelles

Le profil peut contenir identité, photo, localisation, formation,
expérience, secteur, compétences, centres d'intérêt, objectifs, langues
et disponibilité.

Prévoir les contrôles de visibilité publique/privée. Afficher uniquement
les informations autorisées par le backend. Ne pas exposer des données
privées dans une page publique ou dans les métadonnées.

## 10. Architecture Next.js

-   Utiliser l'App Router si c'est l'architecture du projet.
-   Organiser les routes par domaines fonctionnels et groupes de routes
    si utile.
-   Privilégier les React Server Components par défaut.
-   Ajouter `"use client"` uniquement lorsqu'une interaction ou une API
    navigateur le nécessite.
-   Garder les composants client aussi petits que possible.
-   Utiliser les layouts pour les structures partagées.
-   Utiliser les métadonnées Next.js pour le référencement des pages
    publiques.
-   Utiliser les mécanismes de chargement, erreurs et not-found de
    Next.js.
-   Ne jamais exposer de secret dans le bundle client.
-   Ne jamais importer un module serveur dans un composant client.
-   Respecter les conventions et versions réellement présentes dans le
    dépôt.

### 10.1 Organisation indicative

Adapter cette structure à l'existant ; ne pas imposer une refonte sans
raison.

``` text
src/
  app/
    (public)/
    (auth)/
    (beneficiary)/
    (mentor)/
    (admin)/
    layout.tsx
    globals.css
  components/
    ui/
    shared/
    forms/
    navigation/
  features/
    auth/
    profiles/
    mentors/
    diagnosis/
    matching/
    mentoring/
    calendar/
    messaging/
    masterclasses/
    opportunities/
    notifications/
    administration/
    analytics/
  lib/
    api/
    auth/
    schemas/
    utils/
    constants/
  hooks/
  types/
```

Les composants liés à une fonctionnalité doivent rester proches de cette
fonctionnalité. Éviter un dossier `components` contenant toute la
logique métier.

### 10.2 Séparation des responsabilités

-   UI : présentation et interactions.
-   Hooks : logique réutilisable côté client.
-   Services : appels API et orchestration frontend.
-   Schemas : validation Zod.
-   Types : contrats et types partagés.
-   Utils : fonctions pures.
-   Middleware/protection de routes : uniquement selon les mécanismes
    fiables du projet.

Ne pas mettre toute la logique dans les pages. Ne pas créer
d'abstraction inutile pour une seule ligne de code.

## 11. Intégration API et données réelles

Le frontend consomme les contrats backend définis par le projet. Avant
d'intégrer un écran, identifier :

-   endpoint et méthode ;
-   paramètres et payload ;
-   structure de réponse ;
-   pagination et filtres ;
-   erreurs possibles ;
-   authentification requise ;
-   permissions et rôles ;
-   comportement en cas de ressource absente.

Règles :

1.  Ne jamais inventer un endpoint.
2.  Ne jamais inventer la forme d'une réponse API.
3.  Ne jamais supposer qu'une opération a réussi.
4.  Ne jamais remplacer silencieusement une erreur API par des données
    fictives.
5.  Ne pas considérer les contrôles frontend comme une protection
    d'accès.
6.  Centraliser la configuration du client API et la gestion des
    erreurs.
7.  Annuler ou ignorer les requêtes obsolètes lorsque nécessaire.
8.  Prévoir les états loading, success, empty et error.
9.  Respecter les règles de pagination et les limites serveur.
10. Éviter les requêtes répétées ou déclenchées inutilement.

### 11.1 Politique anti-fausses données

-   Les données de démonstration doivent être explicitement identifiées
    comme telles et isolées du fonctionnement réel.
-   Ne jamais mélanger des données fictives et réelles dans une même
    liste sans indication explicite.
-   Ne pas afficher de faux compteurs, faux avis, faux taux de matching
    ou faux témoignages.
-   Ne pas simuler une recherche, une réservation, un envoi de message
    ou une inscription comme si le serveur l'avait confirmé.
-   Si l'API n'est pas disponible, afficher un état de démonstration
    clairement signalé ou un état vide ; ne pas tromper l'utilisateur.
-   En développement, utiliser des fixtures déterministes dans les
    tests, jamais comme fallback silencieux en production.
-   Les exemples présents dans le cahier des charges sont des
    illustrations de comportement, pas des données réelles à publier.

## 12. Sécurité frontend

Appliquer le principe de défense en profondeur et respecter les règles
définies par le backend.

-   Ne jamais stocker de secret, clé privée ou clé serveur dans le code
    client.
-   Ne jamais faire confiance aux rôles, prix, identifiants ou
    permissions envoyés par le navigateur.
-   Ne pas contourner les contrôles serveur avec une simple condition
    d'affichage.
-   Éviter `dangerouslySetInnerHTML`. Si un contenu HTML est
    indispensable, exiger une stratégie de sanitation éprouvée.
-   Valider et encoder les données selon leur contexte d'affichage.
-   Ne pas exposer de données personnelles dans les URLs, logs,
    analytics ou erreurs.
-   Ne pas afficher de stack trace ni de détails internes au visiteur.
-   Protéger les actions sensibles par confirmation et contrôle serveur.
-   Vérifier les redirections et URLs externes pour éviter les
    redirections ouvertes.
-   Gérer les sessions selon l'architecture d'authentification retenue
    par le backend.
-   Ne pas inventer un mécanisme de stockage de token ; suivre le
    contrat sécurisé défini par le backend.
-   Vérifier les permissions sur chaque ressource côté serveur, même si
    l'interface masque les actions.

Les exigences de sécurité globales du projet incluent notamment HTTPS,
contrôle d'accès, gestion des rôles, sauvegardes, logs, sécurisation
API, gestion des sessions et limitation des tentatives de connexion. Le
frontend ne peut pas garantir seul ces contrôles.

## 13. Performance et faible débit

Objectif : une interface rapide et robuste sur réseau mobile et
appareils modestes.

-   Utiliser `next/image` et des formats adaptés.
-   Définir tailles et ratios d'images pour limiter les décalages de
    mise en page.
-   Charger les images et modules non critiques de manière différée.
-   Éviter les bibliothèques lourdes et les dépendances inutiles.
-   Réduire le JavaScript client.
-   Préférer les composants serveur lorsque possible.
-   Paginer ou charger progressivement les longues listes.
-   Éviter les re-renders inutiles et mesurer avant d'optimiser.
-   Mettre en cache uniquement selon la nature des données et les règles
    d'accès.
-   Ne jamais mettre en cache publiquement des données personnelles ou
    privées.
-   Prévoir un feedback de chargement pour les opérations lentes.
-   Optimiser les polices et ressources statiques.
-   Mesurer les Core Web Vitals et les performances sur
    appareils/réseaux représentatifs.

Ne pas sacrifier la sécurité ou l'exactitude des données pour obtenir un
chargement plus rapide.

## 14. États d'interface obligatoires

Chaque écran connecté à des données doit définir explicitement :

-   chargement initial ;
-   chargement d'une action ;
-   succès ;
-   liste vide ;
-   absence de résultat ;
-   erreur serveur ;
-   erreur réseau ;
-   accès refusé ;
-   session expirée ;
-   ressource introuvable ;
-   données partielles si le contrat le permet.

Les états vides doivent expliquer ce qui manque et proposer une action
pertinente. Les erreurs doivent être compréhensibles et ne pas exposer
de détails techniques.

## 15. Exigences par module du MVP

### Authentification

Inscription, connexion, récupération, vérification, acceptation des
conditions et consentements. Respecter les statuts réels du compte et
les validations requises.

### Profils

Consultation, modification, photo, informations professionnelles et
paramètres de visibilité. Distinguer profil privé et profil public.

### Candidature mentor

Collecte des informations prévues : fonction, organisation, parcours,
années d'expérience, expertises, secteurs, langues, publics accompagnés,
types de mentoring, disponibilités, biographie, photo, CV et références.
Afficher clairement le statut de validation. Un mentor non validé ne
doit pas être présenté comme publiquement disponible.

### Diagnostic

Questionnaire avec progression, résultats et recommandations. Les
réponses doivent produire les informations nécessaires au matching :
objectif principal, domaine, niveau et type d'accompagnement souhaité.

### Matching et recherche

Les critères du cahier des charges incluent expertise, objectif,
secteur, expérience, localisation, langue, disponibilité, type de
mentoring, problématique et public cible. Les recommandations doivent
expliquer leur correspondance. Les pondérations sont configurables par
l'administrateur ; le frontend ne doit pas recalculer arbitrairement le
score métier.

### Demande de mentoring

Formulaire comprenant les informations prévues : mentor, mentoré,
objectif, problématique, durée, fréquence, format et message. Gérer les
statuts : en attente, acceptée, refusée, annulée, terminée. Les actions
doivent refléter la réponse confirmée du backend.

### Parcours de mentoring

Objectifs, sous-objectifs, plan d'accompagnement, actions, échéances,
indicateurs, sessions, ressources, commentaires et progression. Le
mentor peut créer un plan ; le mentoré peut consulter ses objectifs et
tâches, marquer une action comme réalisée et visualiser sa progression.

### Agenda

Disponibilités, réservation, annulation, report, rappels et calendrier.
Après réservation confirmée, afficher le créneau selon la réponse
serveur. Ne pas inventer une disponibilité.

### Messagerie

Conversations, pièces jointes, notifications et historique horodaté.
Respecter strictement les permissions d'accès. Gérer les erreurs d'envoi
et les états d'envoi/livraison uniquement si le backend les expose.

### Masterclasses

Catalogue, inscription, calendrier, live, replay et ressources. Afficher
les dates, liens et contenus fournis par le système.

### Opportunités

Catégories : emploi, stage, formation, concours, bourse, financement,
appel à projets et événement. Recherche, filtres, favoris, partage et
candidature externe. Afficher la date d'expiration ; les opportunités
expirées doivent être traitées selon le statut renvoyé par le backend.

### Dashboard bénéficiaire

Présenter les informations disponibles : objectif, progression, mentor,
prochaine session, actions, ressources, opportunités recommandées et
masterclasses à venir. Ne jamais fabriquer des indicateurs si aucune
donnée n'existe.

### Dashboard mentor

Présenter demandes, mentorés, sessions, calendrier, tâches, messages et
progression. Toutes les données doivent respecter le périmètre d'accès
du mentor.

### Notifications

Notifications in-app et email au MVP. Les catégories prévues incluent
demande, acceptation, rendez-vous, message, opportunité, masterclass et
échéance. SMS et WhatsApp sont prévus en V2, pas à simuler dans le MVP.

### Administration

Gestion des utilisateurs, mentors, experts, contenus, opportunités,
programmes, sessions, signalements et statistiques. Protéger les écrans
et actions selon les permissions administrateur réelles.

### Statistiques et impact

Indicateurs prévus : inscrits, profils complétés, mentors, matchs,
sessions, taux de complétion, satisfaction, formations, opportunités,
emplois et entreprises. Export CSV, Excel et PDF selon les API et
autorisations disponibles. Ne pas inventer de valeurs pour remplir un
graphique.

## 16. Qualité du code

-   Code lisible, cohérent, typé et maintenable.
-   Composants focalisés sur une responsabilité.
-   Fonctions pures lorsque possible.
-   Pas de duplication de logique métier.
-   Pas de fichiers énormes difficiles à maintenir.
-   Pas de `console.log` résiduel ni de secrets dans le dépôt.
-   Pas de code mort, imports inutilisés ou dépendances inutilisées.
-   Nommage explicite et conventions constantes.
-   Commentaires pour expliquer le pourquoi, pas paraphraser le code.
-   Gestion explicite des erreurs.
-   Pas de désactivation injustifiée des règles ESLint ou TypeScript.
-   Pas de contournement de type avec `as any`.
-   Ne pas installer une dépendance si la plateforme ou le projet
    fournit déjà une solution suffisante.

## 17. Tests et critères de validation

Écrire et exécuter des tests adaptés au risque :

-   tests unitaires des fonctions et schémas ;
-   tests des composants et formulaires ;
-   tests d'intégration API ;
-   tests end-to-end des parcours critiques ;
-   tests responsive ;
-   tests clavier et accessibilité ;
-   tests des états d'erreur et permissions.

Parcours critiques à couvrir au minimum :

1.  Inscription et connexion.
2.  Complétion du profil.
3.  Candidature et validation mentor.
4.  Diagnostic.
5.  Recherche et matching.
6.  Demande de mentoring et réponse.
7.  Réservation et annulation de session.
8.  Messagerie autorisée.
9.  Suivi d'une tâche du parcours.
10. Consultation d'opportunités.
11. Actions d'administration protégées.

Vérifier au minimum Chrome, Edge, Firefox et Safari, ainsi que
smartphone, tablette et ordinateur, conformément au cahier des charges.

Ne jamais déclarer les tests réussis s'ils n'ont pas été exécutés.
Mentionner précisément les tests non exécutés et les limites connues.

## 18. Référencement et contenu

Pour les pages publiques :

-   titres et descriptions spécifiques ;
-   structure de titres logique ;
-   URLs lisibles lorsque le routage le permet ;
-   métadonnées adaptées ;
-   images avec textes alternatifs utiles ;
-   contenu réellement disponible et validé.

Les espaces privés et données personnelles ne doivent pas être indexés.
Ne pas exposer des données privées dans les métadonnées, le HTML public
ou les aperçus de partage.

## 19. Règles de collaboration avec le backend

Le frontend et le backend doivent partager les mêmes concepts métier et
respecter les contrats documentés.

Avant de développer un écran, vérifier les modèles et champs réellement
disponibles. Si un champ est absent, ne pas le créer unilatéralement
dans l'interface en prétendant qu'il est enregistré.

Pour chaque évolution nécessitant une modification backend, documenter :

-   besoin fonctionnel ;
-   données requises ;
-   endpoint ou contrat à ajouter ;
-   permissions nécessaires ;
-   validation serveur ;
-   comportement attendu en cas d'erreur.

Ne jamais exposer la clé `service_role` Supabase, une clé privée ou un
secret backend dans le navigateur. Toute opération privilégiée doit être
exécutée dans un environnement serveur sécurisé.

## 20. Gestion des ambiguïtés

Si une information essentielle manque :

1.  Identifier précisément ce qui manque.
2.  Expliquer pourquoi cela bloque une implémentation fiable.
3.  Poser une question courte et ciblée.
4.  Ne pas inventer une règle métier pour avancer.

Si l'incertitude ne bloque pas le travail, proposer une solution
provisoire clairement identifiée comme hypothèse et la faire valider
avant de la considérer comme définitive.

Ne pas interpréter un silence comme une autorisation de créer une
fonctionnalité supplémentaire.

## 21. Définition de « terminé »

Une fonctionnalité n'est terminée que si :

-   son comportement correspond au cahier des charges ;
-   les données proviennent d'une source réelle ou d'un état vide
    explicite ;
-   les permissions sont respectées et vérifiées côté serveur ;
-   les validations et erreurs sont traitées ;
-   les états loading, success, empty et error existent selon le besoin
    ;
-   le rendu est responsive ;
-   l'accessibilité de base est vérifiée ;
-   les tests pertinents ont été exécutés ;
-   aucune donnée fictive n'est présentée comme réelle ;
-   le code respecte l'architecture et les conventions du projet ;
-   la documentation utile est mise à jour.

## 22. Format de compte rendu attendu

À la fin de chaque lot de travail, fournir :

1.  **Objectif réalisé** --- fonctionnalité et périmètre.
2.  **Fichiers créés/modifiés** --- chemins exacts et rôle.
3.  **Intégration** --- endpoints et contrats utilisés, ou blocages
    backend.
4.  **Validation** --- commandes et tests réellement exécutés avec
    résultats.
5.  **Responsive/accessibilité** --- vérifications effectuées.
6.  **Sécurité et données** --- permissions, données personnelles,
    absence de données fictives.
7.  **Points restants** --- problèmes, hypothèses à valider et tâches
    non terminées.

## 23. Instructions finales impératives

Tu dois toujours :

-   privilégier l'exactitude fonctionnelle à l'effet visuel ;
-   concevoir une expérience simple malgré la richesse du produit ;
-   respecter le cahier des charges et les priorités MVP/V2/V3 ;
-   utiliser les technologies de la stack de façon maîtrisée ;
-   construire des composants réutilisables sans sur-ingénierie ;
-   anticiper les connexions lentes et les appareils modestes ;
-   protéger les données personnelles ;
-   demander clarification plutôt que fabriquer une règle ;
-   signaler clairement les dépendances backend manquantes ;
-   ne jamais produire de fausses données ou de faux résultats ;
-   ne jamais annoncer une fonctionnalité comme opérationnelle sans
    l'avoir réellement intégrée et testée.

**La qualité attendue est celle d'un produit numérique professionnel,
fiable, accessible, évolutif et prêt à être utilisé par de vrais
bénéficiaires, mentors, partenaires et administrateurs.**
