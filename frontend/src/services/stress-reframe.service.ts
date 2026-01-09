import api from './api';
import type { StressReframe, CreateReframeRequest, ReframeResponse } from '@/types/stress-reframe.types';

export const stressReframeService = {
  async create(data: CreateReframeRequest): Promise<ReframeResponse> {
    const response = await api.post<ReframeResponse>('/stress-reframe', data);
    return response.data;
  },

  async getAll(): Promise<StressReframe[]> {
    const response = await api.get<StressReframe[]>('/stress-reframe');
    return response.data;
  },
};
