
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  details: string; // Detailed history for the modal
  type: 'sacred' | 'historical' | 'nature';
  x: number; // Percentage from left 0-100
  y: number; // Percentage from top 0-100
}

export interface Course {
  id: string;
  title: string;
  icon: any; // React Node
  desc: string;
  level: string;
  modules: string[];
  duration: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'Tech' | 'Culture' | 'Event';
  excerpt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: any; // Lucide Icon
  description: string;
  unlocked: boolean;
}

export type Archetype = 'ARCHITECTE_NUMERIQUE' | 'GARDIEN_DES_ARCHIVES' | 'GRIOT_CYBERNETIQUE' | null;

export interface UserProfile {
  name: string;
  phone: string; // Only phone, no email
  archetype: Archetype;
  level: number;
  xp: number; // Waniyilo Points (WP)
  badges: string[]; // IDs of unlocked badges
  joinedAt: string;
}

export interface XPNotification {
    id: number;
    amount: number;
    reason: string;
}

export enum Section {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  CULTURE = 'CULTURE',
  ACADEMY = 'ACADEMY',
  LAB = 'LAB',
  NEWS = 'NEWS',
  PARTNERS = 'PARTNERS',
  BLOG = 'BLOG'
}
