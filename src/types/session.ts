export interface Session {
  uid: string;
  name: string;
  description?: string;
  songUid: string;
  vrConfig: Record<string, any>;
} 