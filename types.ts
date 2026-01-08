
export enum Mood {
  HAPPY = 'Happy',
  SAD = 'Sad',
  STRESSED = 'Stressed',
  EXCITED = 'Excited',
  NEUTRAL = 'Neutral'
}

export interface Recommendation {
  title: string;
  reason: string;
  platform: string;
  deliveryTime?: string;
  image?: string;
}

export interface MoodAnalysis {
  mood: Mood;
  confidence: number;
  explanation: string;
  recommendations: {
    shopping: Recommendation[];
    food: Recommendation[];
    music: Recommendation[];
    books: Recommendation[];
  };
}

export interface UserInputData {
  text: string;
  location: string;
  gender: string;
  energyLevel: number; // 1-5
  socialContext: string; // Alone, Partner, Friends, Family
  activityContext: string; // Working, Commuting, Relaxing, Exercising
  primaryGoal: string; // Relax, Focus, Celebrate, Vent
}
