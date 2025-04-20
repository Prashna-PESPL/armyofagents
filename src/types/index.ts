export interface Agent {
  name: string;
  description: string;
  avatarUrl: string;
  status: 'active' | 'learning' | 'maintenance';
  version: string;
  capabilities: string[];
  metrics: {
    accuracy: number;
    speed: number;
  };
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}