
export interface EditedImage {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
  /** URL Firebase Storage (si enregistré) */
  firebaseUrl?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SAVING = 'SAVING',
  ERROR = 'ERROR'
}
