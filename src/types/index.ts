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
