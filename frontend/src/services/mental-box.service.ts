import api from './api';
import type {
  MentalBoxEntry,
  CreateMentalBoxRequest,
  UpdateMentalBoxRequest,
} from '@/types/mental-box.types';

export const mentalBoxService = {
  async getAll(): Promise<MentalBoxEntry[]> {
    const response = await api.get<MentalBoxEntry[]>('/mental-box');
    return response.data;
  },

  async getById(id: string): Promise<MentalBoxEntry> {
    const response = await api.get<MentalBoxEntry>(`/mental-box/${id}`);
    return response.data;
  },

  async create(data: CreateMentalBoxRequest): Promise<MentalBoxEntry> {
    const response = await api.post<MentalBoxEntry>('/mental-box', data);
    return response.data;
  },

  async update(id: string, data: UpdateMentalBoxRequest): Promise<MentalBoxEntry> {
    const response = await api.put<MentalBoxEntry>(`/mental-box/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/mental-box/${id}`);
  },
};
