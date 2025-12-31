import { Summary } from '@/types';

const STORAGE_KEY = 'meeting-summarizer-history';

export function getSummaries(): Summary[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Summary[];
  } catch {
    console.error('Failed to parse summaries from localStorage');
    return [];
  }
}

export function saveSummary(summary: Summary): void {
  if (typeof window === 'undefined') return;
  
  try {
    const summaries = getSummaries();
    summaries.unshift(summary);
    // Keep only the last 50 summaries
    const trimmed = summaries.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    console.error('Failed to save summary to localStorage');
  }
}

export function deleteSummary(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const summaries = getSummaries();
    const filtered = summaries.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    console.error('Failed to delete summary from localStorage');
  }
}

export function clearAllSummaries(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateTitle(content: string): string {
  // Extract first meaningful line or first 50 chars
  const firstLine = content.split('\n').find(line => line.trim().length > 0) || content;
  const cleaned = firstLine.replace(/[•\-*#]/g, '').trim();
  if (cleaned.length <= 50) return cleaned;
  return cleaned.substring(0, 47) + '...';
}

