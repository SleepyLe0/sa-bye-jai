export interface StressReframe {
  id: string;
  user_id: string;
  mental_box_id?: string;
  original_thought: string;
  stoic_reframe: string;
  optimist_reframe: string;
  realist_reframe: string;
  created_at: string;
}

export interface CreateReframeRequest {
  mental_box_id?: string;
  original_thought: string;
}

export interface ReframeResponse {
  id: string;
  mental_box_id?: string;
  original_thought: string;
  stoic_reframe: string;
  optimist_reframe: string;
  realist_reframe: string;
  created_at: string;
}
