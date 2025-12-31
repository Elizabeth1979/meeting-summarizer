'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MeetingInput } from '@/components/MeetingInput';
import { AudioInput } from '@/components/AudioInput';
import { FormatSelector } from '@/components/FormatSelector';
import { SummaryOutput } from '@/components/SummaryOutput';
import { HistoryPanel } from '@/components/HistoryPanel';
import { 
  getSummaries, 
  saveSummary, 
  deleteSummary, 
  clearAllSummaries,
  generateId,
  generateTitle 
} from '@/lib/storage';
import { InputMode, SummaryFormat, Summary } from '@/types';

type ProcessingStep = 'idle' | 'transcribing' | 'summarizing';

export default function Home() {
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>('bullet-points');
  
  // Processing state
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Output state
  const [currentSummary, setCurrentSummary] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  // History state
  const [summaries, setSummaries] = useState<Summary[]>([]);
  
  // Load summaries from localStorage on mount
  useEffect(() => {
    setSummaries(getSummaries());
  }, []);

  // Determine source type based on input mode and method
  const getSourceType = useCallback((): Summary['sourceType'] => {
    if (inputMode === 'text') {
      return 'text';
    }
    return 'audio-recording';
  }, [inputMode]);

  // Handle transcription
  const transcribeAudio = async (blob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Transcription failed');
    }

    return data.text;
  };

  // Handle summarization
  const summarizeText = async (text: string, format: SummaryFormat): Promise<string> => {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, format }),
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Summarization failed');
    }

    return data.summary;
  };

  // Main generate handler
  const handleGenerate = async () => {
    setError(null);
    setCurrentSummary('');
    setIsSaved(false);
    setProgress(0);

    try {
      let textToSummarize = textInput;

      // If audio mode, first transcribe
      if (inputMode === 'audio' && audioBlob) {
        setProcessingStep('transcribing');
        setProgress(20);
        
        textToSummarize = await transcribeAudio(audioBlob);
        setProgress(50);
        
        // Also set the text input so user can see/edit
        setTextInput(textToSummarize);
      }

      if (!textToSummarize.trim()) {
        throw new Error('No text to summarize. Please provide meeting content.');
      }

      // Now summarize
      setProcessingStep('summarizing');
      setProgress(70);
      
      const summary = await summarizeText(textToSummarize, selectedFormat);
      setProgress(100);
      
      setCurrentSummary(summary);
      setProcessingStep('idle');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setProcessingStep('idle');
      setProgress(0);
    }
  };

  // Handle save
  const handleSave = useCallback(() => {
    if (!currentSummary) return;

    const newSummary: Summary = {
      id: generateId(),
      content: currentSummary,
      format: selectedFormat,
      sourceType: getSourceType(),
      timestamp: Date.now(),
      title: generateTitle(currentSummary),
    };

    saveSummary(newSummary);
    setSummaries(getSummaries());
    setIsSaved(true);
  }, [currentSummary, selectedFormat, getSourceType]);

  // Handle selecting a summary from history
  const handleSelectSummary = useCallback((summary: Summary) => {
    setCurrentSummary(summary.content);
    setSelectedFormat(summary.format);
    setIsSaved(true);
  }, []);

  // Handle deleting a summary
  const handleDeleteSummary = useCallback((id: string) => {
    deleteSummary(id);
    setSummaries(getSummaries());
  }, []);

  // Handle clearing all summaries
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all saved summaries?')) {
      clearAllSummaries();
      setSummaries([]);
    }
  }, []);

  // Check if we can generate
  const canGenerate = inputMode === 'text' 
    ? textInput.trim().length > 0 
    : audioBlob !== null;

  const isProcessing = processingStep !== 'idle';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
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
                className="text-primary"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Meeting Summarizer</h1>
              <p className="text-sm text-muted-foreground">
                Transform messy meetings into clear summaries
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Mode Tabs */}
            <Tabs 
              value={inputMode} 
              onValueChange={(v) => setInputMode(v as InputMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="text" className="gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 6.1H3" />
                    <path d="M21 12.1H3" />
                    <path d="M15.1 18H3" />
                  </svg>
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                  Audio Input
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <MeetingInput
                  value={textInput}
                  onChange={setTextInput}
                  disabled={isProcessing}
                />
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <AudioInput
                  onAudioReady={setAudioBlob}
                  audioBlob={audioBlob}
                  disabled={isProcessing}
                />
              </TabsContent>
            </Tabs>

            {/* Format Selector */}
            <FormatSelector
              selected={selectedFormat}
              onSelect={setSelectedFormat}
              disabled={isProcessing}
            />

            {/* Generate Button & Progress */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isProcessing}
                size="lg"
                className="w-full gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {processingStep === 'transcribing' ? 'Transcribing...' : 'Generating Summary...'}
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    Generate Summary
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {processingStep === 'transcribing' 
                      ? 'Transcribing audio...' 
                      : 'Generating summary with AI...'}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-destructive shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Output */}
            <SummaryOutput
              summary={currentSummary}
              format={selectedFormat}
              isLoading={processingStep === 'summarizing'}
              onSave={handleSave}
              isSaved={isSaved}
            />
          </div>

          {/* Right Column - History */}
          <div className="space-y-6">
            <HistoryPanel
              summaries={summaries}
              onSelect={handleSelectSummary}
              onDelete={handleDeleteSummary}
              onClearAll={handleClearAll}
            />

            {/* Ollama Status Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Local AI Setup</p>
                    <p className="text-xs text-muted-foreground">
                      Make sure Ollama is running:
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mt-2">
                      ollama serve
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Required model:
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                      ollama pull llama3.2
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-xs text-center text-muted-foreground">
            Powered by Ollama with llama3.2 • All processing happens locally on your machine
          </p>
        </div>
      </footer>
    </div>
  );
}
