/**
 * Constantes de routes de l'application
 * Structurées par espace utilisateur
 */

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  MENTORS_CATALOG: '/mentors',
  OPPORTUNITIES_CATALOG: '/opportunities',
  MASTERCLASSES_CATALOG: '/masterclasses',

  // Authentification
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_ACCOUNT: '/verify',
  },

  // Légal & conformité
  LEGAL: {
    CGU: '/cgu',
    PRIVACY: '/privacy',
  },

  // Espace Bénéficiaire
  BENEFICIARY: {
    DASHBOARD: '/dashboard/beneficiaire',
    DIAGNOSIS: '/diagnostic',
    RECOMMENDATIONS: '/beneficiary/recommendations',
    MENTOR_REQUEST: (mentorId: string) => `/beneficiary/request/${mentorId}`,
    MY_MENTORS: '/beneficiary/mentors',
    PARCOURS: '/beneficiary/parcours',
    SESSIONS: '/beneficiary/sessions',
    MESSAGES: '/beneficiary/messages',
    OPPORTUNITIES: '/beneficiary/opportunities',
    PROFILE: '/beneficiary/profile',
  },

  // Espace Mentor
  MENTOR: {
    DASHBOARD: '/dashboard/mentor',
    APPLICATION: '/dashboard/mentor/candidature',
    REQUESTS: '/mentor/requests',
    PARCOURS: '/mentor/parcours',
    CALENDAR: '/mentor/calendar',
    MESSAGES: '/mentor/messages',
    PROFILE: '/mentor/profile',
  },

  // Espace Expert & Partenaire
  EXPERT: {
    DASHBOARD: '/dashboard/expert',
  },
  PARTNER: {
    DASHBOARD: '/dashboard/partenaire',
  },

  // Redirections contextuelles & Tableaux de bord
  DASHBOARDS: {
    ADMIN: '/admin',
    BENEFICIAIRE: '/dashboard/beneficiaire',
    DIAGNOSTIC: '/diagnostic',
    MENTOR: '/dashboard/mentor',
    MENTOR_CANDIDATURE: '/dashboard/mentor/candidature',
    EXPERT: '/dashboard/expert',
    PARTENAIRE: '/dashboard/partenaire',
  },

  // Espace Administration
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    VALIDATIONS: '/admin/validations',
    USERS: '/admin/users',
    OPPORTUNITIES: '/admin/opportunities',
    MASTERCLASSES: '/admin/masterclasses',
    ANALYTICS: '/admin/analytics',
  },
} as const;
