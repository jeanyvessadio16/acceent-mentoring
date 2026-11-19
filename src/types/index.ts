/**
 * Types du domaine ACCEENT Plateforme Mentoring
 * Conforme aux spécifications MVP du cahier des charges
 */

// --- Rôles et Utilisateurs ---
export type UserRole = 'beneficiary' | 'mentor' | 'expert' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  isVerified: boolean;
  age?: number;
  sexe?: 'Femme' | 'Homme';
  milieuResidence?: 'Rural' | 'Urbain';
  sdh?: 'Oui' | 'Non';
  createdAt: string;
  updatedAt: string;
}

// --- Profil Mentor ---
export type MentorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type MentoringFormat = 'individual' | 'collective' | 'hybrid';

export interface MentorProfile {
  id: string;
  userId: string;
  title: string;
  organization?: string;
  bio: string;
  yearsOfExperience: number;
  expertises: string[];
  sectors: string[];
  languages: string[];
  targetAudiences: string[];
  mentoringFormats: MentoringFormat[];
  isAvailable: boolean;
  status: MentorStatus;
  avatarUrl?: string;
  cvUrl?: string;
  user?: Partial<User>;
}

// --- Diagnostic Utilisateur & Matching ---
export interface DiagnosisAnswer {
  currentSituation: string;
  primaryObjective: string;
  domain: string;
  targetLevel: string;
  identifiedNeeds: string[];
  constraints?: string[];
  preferredFormat: MentoringFormat;
  weeklyAvailabilityHours: number;
}

export interface MatchingResult {
  mentorId: string;
  mentor: MentorProfile;
  score: number; // 0 to 100
  matchReasons: string[];
}

// --- Demandes de Mentoring & Parcours ---
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface MentoringRequest {
  id: string;
  beneficiaryId: string;
  mentorId: string;
  objective: string;
  problemStatement: string;
  durationMonths: number;
  sessionFrequency: string;
  preferredFormat: MentoringFormat;
  initialMessage: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface MentoringTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
}

export interface MentoringMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  isCompleted: boolean;
  tasks: MentoringTask[];
}

export interface MentoringPath {
  id: string;
  requestId: string;
  beneficiaryId: string;
  mentorId: string;
  title: string;
  generalObjective: string;
  progressPercentage: number;
  milestones: MentoringMilestone[];
  createdAt: string;
  updatedAt: string;
}

// --- Sessions & Calendrier ---
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface MentoringSession {
  id: string;
  pathId?: string;
  mentorId: string;
  beneficiaryId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
  status: SessionStatus;
}

// --- Opportunités & Masterclasses ---
export type OpportunityCategory =
  | 'job'
  | 'internship'
  | 'training'
  | 'competition'
  | 'grant'
  | 'funding'
  | 'call_for_projects'
  | 'event';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  location: string;
  description: string;
  expiresAt: string;
  externalUrl?: string;
  isFeatured?: boolean;
}

export interface Masterclass {
  id: string;
  title: string;
  speakerName: string;
  speakerRole: string;
  category: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  replayUrl?: string;
}

// --- Notifications & Messages ---
export type NotificationType =
  | 'request'
  | 'acceptance'
  | 'session'
  | 'message'
  | 'opportunity'
  | 'masterclass'
  | 'deadline';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}

// --- Espace Administration ---
export interface AdminDashboardStats {
  totalUsers: number;
  totalBeneficiaries: number;
  totalMentors: number;
  totalPartners: number;
  pendingValidations: number;
  activePrograms: number;
  completedSessions: number;
  satisfactionRate: number;
  demographics: {
    femalePercentage: number;
    malePercentage: number;
    ruralPercentage: number;
    urbanPercentage: number;
    sdhPercentage: number;
    averageAge: number;
  };
}

export interface PendingValidationItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'mentor' | 'expert';
  title: string;
  organization?: string;
  yearsOfExperience: number;
  expertises: string[];
  sectors?: string[];
  bio?: string;
  cvUrl?: string | null;
  linkedinUrl?: string | null;
  mentoringFormat?: string;
  availability?: string | null;
  references?: string | null;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecentAdminActivity {
  id: string;
  type:
    | 'user_registered'
    | 'mentor_applied'
    | 'mentor_approved'
    | 'session_held'
    | 'opportunity_published';
  title: string;
  description: string;
  timestamp: string;
  userRole?: string;
}

// --- Espace Bénéficiaire ---
export interface BeneficiaryDashboardData {
  user: {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: string;
    statutCompte: string;
    age?: number | null;
    sexe?: string | null;
    milieuResidence?: string | null;
    situationHandicap: boolean;
    photoUrl?: string | null;
  };
  hasCompletedDiagnosis: boolean;
  diagnostic?: {
    id: string;
    domaine?: string;
    objectifPrincipal?: string;
    isCompleted: boolean;
  } | null;
  activeProgramsCount: number;
  upcomingSessionsCount: number;
  completedSessionsCount: number;
  averageProgress: number;
  activeProgram?: {
    id: string;
    titre: string;
    progression: number;
    mentorName: string;
    mentorTitle?: string;
    mentorEmail?: string;
    goalsCount: number;
    tasksCount: number;
  } | null;
  upcomingSessions: Array<{
    id: string;
    titre: string;
    mentorName: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl?: string | null;
    status: string;
  }>;
  recommendedMentors: Array<{
    id: string;
    mentorId: string;
    nom: string;
    prenom: string;
    fonction: string;
    organisation: string;
    expertises: string[];
    anneesExperience: number;
    isAvailable: boolean;
    scoreTotal?: number;
    justification?: string;
  }>;
}
