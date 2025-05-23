export interface Playlist {
  uid: string;
  name: string;
  repeat: boolean;
  sessions: string[]; // Liste ordonnée d'UID de sessions
} 