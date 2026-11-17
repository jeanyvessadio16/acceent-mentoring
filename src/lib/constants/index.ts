export * from './routes';

export const USER_ROLES = {
  BENEFICIARY: 'beneficiary',
  MENTOR: 'mentor',
  EXPERT: 'expert',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const;

export const MENTORING_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const APP_CONFIG = {
  NAME: 'ACCEENT Mentoring',
  DESCRIPTION: 'Plateforme digitale de mentoring, compétences, réseaux et opportunités',
  TARGET_REGION: 'Sénégal & Afrique de l\'Ouest',
} as const;
