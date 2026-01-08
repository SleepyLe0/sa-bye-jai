import api from './api';
import type {
  MoodEntry,
  CreateMoodEntryRequest,
  UpdateMoodEntryRequest,
  MoodStats,
} from '@/types/mood-tracker.types';

export const moodTrackerService = {
  async getAll(): Promise<MoodEntry[]> {
    const response = await api.get<MoodEntry[]>('/mood-tracker');
    return response.data;
  },

  async getById(id: string): Promise<MoodEntry> {
    const response = await api.get<MoodEntry>(`/mood-tracker/${id}`);
    return response.data;
  },

  async getRecent(limit: number = 7): Promise<MoodEntry[]> {
    const response = await api.get<MoodEntry[]>(`/mood-tracker/recent?limit=${limit}`);
    return response.data;
  },

  async getStats(): Promise<MoodStats> {
    const response = await api.get<MoodStats>('/mood-tracker/stats');
    return response.data;
  },

  async create(data: CreateMoodEntryRequest): Promise<MoodEntry> {
    const response = await api.post<MoodEntry>('/mood-tracker', data);
    return response.data;
  },

  async update(id: string, data: UpdateMoodEntryRequest): Promise<MoodEntry> {
    const response = await api.put<MoodEntry>(`/mood-tracker/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/mood-tracker/${id}`);
  },
};
