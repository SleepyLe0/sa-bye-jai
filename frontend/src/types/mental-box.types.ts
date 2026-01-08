export interface MentalBoxEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMentalBoxRequest {
  title: string;
  content: string;
}

export interface UpdateMentalBoxRequest {
  title?: string;
  content?: string;
}
