export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  stress_level: number; // 1-10
  note?: string;
  activities?: string[]; // What helped/what you did
  created_at: string;
  updated_at: string;
}

export interface CreateMoodEntryRequest {
  mood: MoodType;
  stress_level: number;
  note?: string;
  activities?: string[];
}

export interface UpdateMoodEntryRequest {
  mood?: MoodType;
  stress_level?: number;
  note?: string;
  activities?: string[];
}

export interface MoodStats {
  average_stress: number;
  most_common_mood: MoodType;
  total_entries: number;
  entries_this_week: number;
}
