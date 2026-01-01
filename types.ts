
export enum Mood {
  EXCITED = 'EXCITED',
  HAPPY = 'HAPPY',
  CALM = 'CALM',
  TIRED = 'TIRED',
  STRESSED = 'STRESSED',
  ANXIOUS = 'ANXIOUS',
  SAD = 'SAD'
}

export type MentorPersona = 'balanced' | 'formal' | 'casual' | 'encouraging';

export interface Task {
  id: string;
  title: string;
  category: string;
  duration: number; // in minutes
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  links?: { title: string; url: string }[];
}

export interface StudyPlan {
  title: string;
  sessions: {
    topic: string;
    duration: number;
    description: string;
    resources: { title: string; url: string }[];
  }[];
}

export interface MoodEntry {
  date: string;
  mood: Mood;
  note?: string;
  stressLevel: number; // 1-10
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AppView = 'home' | 'library' | 'mentor' | 'planner' | 'wellness' | 'report';
