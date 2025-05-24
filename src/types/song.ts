export interface Song {
  uid: string;
  name: string;
  duration: number;
  tags?: string[];
  triggers?: string[];
} 