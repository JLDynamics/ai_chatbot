export interface Chat {
  name: string;
  message_count: number;
  last_message: string | null;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Memory {
  id: string;
  memory: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
