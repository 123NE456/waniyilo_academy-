
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
  icon?: any; // React Node (Legacy)
  iconName?: string; // String for DB mapping
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

export interface Comment {
    id: string;
    news_id: string;
    user_name: string;
    content: string;
    created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  iconName: string; // Lucide Icon Name
  description: string;
  unlocked: boolean;
}

export type Archetype = 'ARCHITECTE_NUMERIQUE' | 'GARDIEN_DES_ARCHIVES' | 'GRIOT_CYBERNETIQUE' | 'ADMIN' | null;

export interface UserProfile {
  name: string;
  phone: string; // Only phone, no email
  matricule: string; // Unique ID (W26-XXXXXX)
  archetype: Archetype;
  level: number;
  xp: number; // Waniyilo Points (WP)
  badges: string[]; // IDs of unlocked badges
  joinedAt: string;
}

export interface LeaderboardEntry {
    name: string;
    archetype: Archetype;
    xp: number;
    level: number;
}

export interface NexusMessage {
  id: number;
  user_name: string;
  user_phone: string; // To identify own messages
  archetype: string;
  content: string;
  created_at: string;
}

export interface XPNotification {
    id: number;
    amount: number;
    reason: string;
}

export interface VocabularyItem {
    id: number;
    level: number;
    fr: string;
    fon: string;
    options: string[];
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
