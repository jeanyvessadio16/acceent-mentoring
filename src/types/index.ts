export type UserRole = 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'PARTNER' | 'ADMIN';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: string;
  city?: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile extends UserProfile {
  role: 'MENTOR' | 'EXPERT';
  title: string;
  company?: string;
  experienceYears: number;
  sectors: string[];
  targetAudiences: string[];
  mentoringTypes: ('INDIVIDUAL' | 'GROUP' | 'FLASH')[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  validationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type MentoringRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface MentoringRequest {
  id: string;
  beneficiaryId: string;
  beneficiary?: UserProfile;
  mentorId: string;
  mentor?: MentorProfile;
  objective: string;
  problemStatement: string;
  expectedDuration: string;
  preferredFormat: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  message: string;
  status: MentoringRequestStatus;
  createdAt: string;
}

export interface MentoringJourney {
  id: string;
  requestId: string;
  beneficiaryId: string;
  mentorId: string;
  title: string;
  description: string;
  progressPercent: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  tasks: JourneyTask[];
}

export interface JourneyTask {
  id: string;
  title: string;
  isDone: boolean;
  dueDate?: string;
}

export interface SessionAppointment {
  id: string;
  mentorId: string;
  mentorName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  location: string;
  category: 'EMPLOI' | 'STAGE' | 'FORMATION' | 'CONCOURS' | 'BOURSE' | 'FINANCEMENT' | 'APPEL_PROJETS' | 'EVENEMENT';
  deadline: string;
  description: string;
  isExpired: boolean;
  applicationUrl?: string;
}

export interface MasterclassItem {
  id: string;
  title: string;
  speakerName: string;
  speakerRole: string;
  speakerAvatar?: string;
  scheduledAt: string;
  durationMinutes: number;
  category: string;
  description: string;
  liveUrl?: string;
  replayUrl?: string;
  participantCount: number;
  isRegistered?: boolean;
}

export interface BeneficiaryDashboardData {
  myObjective: string | null;
  myProgressPercentage: number;
  myMentor: {
    id: string;
    userId: string;
    jobTitle: string;
    organization: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
        avatarPath?: string;
      };
    };
  } | null;
  nextSession: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    meetingUrl?: string;
    title?: string;
  } | null;
  myActions: Array<{
    id: string;
    title: string;
    dueDate?: string;
    status: string;
    objectiveTitle?: string;
  }>;
  myResources: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  recommendedOpportunities: Array<{
    id: string;
    title: string;
    organization: string;
    category: string;
    expiresAt: string;
    country: string;
    city?: string;
    externalUrl?: string;
    description?: string;
  }>;
  upcomingMasterclasses: Array<{
    id: string;
    title: string;
    speakerName: string;
    category: string;
    scheduledAt: string;
    durationMins: number;
    description?: string;
  }>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'REQUEST' | 'SESSION' | 'MESSAGE' | 'OPPORTUNITY' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

