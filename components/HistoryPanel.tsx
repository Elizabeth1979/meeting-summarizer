'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Summary, SummaryFormat } from '@/types';

interface HistoryPanelProps {
  summaries: Summary[];
  onSelect: (summary: Summary) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const FORMAT_LABELS: Record<SummaryFormat, string> = {
  'bullet-points': 'Bullets',
  'action-items': 'Actions',
  'structured-table': 'Structured',
};

const SOURCE_LABELS: Record<Summary['sourceType'], string> = {
  'text': 'Text',
  'file': 'File',
  'audio-upload': 'Audio',
  'audio-recording': 'Recording',
};

export function HistoryPanel({ summaries, onSelect, onDelete, onClearAll }: HistoryPanelProps) {
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  if (summaries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              No summaries yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your saved summaries will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">History</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {summaries.map((summary, index) => (
            <div key={summary.id}>
              {index > 0 && <Separator />}
              <button
                onClick={() => onSelect(summary)}
                className="w-full text-left p-4 hover:bg-muted/50 transition-colors focus:outline-none focus-visible:bg-muted"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium line-clamp-2 flex-1">
                      {summary.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(summary.id);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {FORMAT_LABELS[summary.format]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {SOURCE_LABELS[summary.sourceType]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {formatDate(summary.timestamp)}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

