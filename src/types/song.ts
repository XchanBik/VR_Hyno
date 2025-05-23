export interface Song {
  uid: string;
  name: string;
  filename: string;
  duration: number;
  tags?: string[];
  triggers?: string[];
} 