'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SummaryFormat, FormatOption } from '@/types';

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'bullet-points',
    title: 'Bullet Points',
    description: 'Hierarchical overview with main topics and key points',
    icon: 'list',
    example: '• Main topic\n  - Key point 1\n  - Key point 2',
  },
  {
    id: 'action-items',
    title: 'Action Items',
    description: 'Task list with owners, deadlines, and priorities',
    icon: 'check',
    example: '1. Complete report\n   Owner: John\n   Due: Friday',
  },
  {
    id: 'structured-table',
    title: 'Structured Summary',
    description: 'Organized sections: overview, decisions, next steps',
    icon: 'table',
    example: 'Overview:\nDecisions:\nNext Steps:',
  },
];

interface FormatSelectorProps {
  selected: SummaryFormat;
  onSelect: (format: SummaryFormat) => void;
  disabled?: boolean;
}

export function FormatSelector({ selected, onSelect, disabled }: FormatSelectorProps) {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'list':
        return (
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
          >
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        );
      case 'check':
        return (
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
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case 'table':
        return (
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
          >
            <path d="M3 3h18v18H3z" />
            <path d="M21 9H3" />
            <path d="M21 15H3" />
            <path d="M9 21V9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Summary Format
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            aria-pressed={selected === option.id}
          >
            <Card
              className={`h-full transition-all duration-200 cursor-pointer hover:border-primary/50 ${
                selected === option.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selected === option.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {getIcon(option.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{option.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
                <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded text-muted-foreground overflow-hidden">
                  {option.example}
                </pre>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

