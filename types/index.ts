export type SummaryFormat = 'bullet-points' | 'action-items' | 'structured-table';

export type InputMode = 'text' | 'audio';

export interface Summary {
  id: string;
  content: string;
  format: SummaryFormat;
  sourceType: 'text' | 'file' | 'audio-upload' | 'audio-recording';
  timestamp: number;
  title: string;
}

export interface FormatOption {
  id: SummaryFormat;
  title: string;
  description: string;
  icon: string;
  example: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface TranscriptionResponse {
  text: string;
  error?: string;
}

export interface SummarizeResponse {
  summary: string;
  error?: string;
}

