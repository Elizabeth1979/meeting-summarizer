'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    formatDuration,
  } = useAudioRecorder();

  const audioRef = useRef<HTMLAudioElement>(null);

  // Notify parent when recording is complete
  useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Recording indicator and timer */}
          <div className="flex flex-col items-center space-y-2">
            {isRecording && (
              <div className="flex items-center gap-2">
                <span 
                  className={`h-3 w-3 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse-recording'}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-red-500">
                  {isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
            )}
            <div 
              className="text-4xl font-mono font-bold tabular-nums"
              role="timer"
              aria-label={`Recording duration: ${formatDuration(duration)}`}
            >
              {formatDuration(duration)}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {!isRecording && !audioUrl && (
              <Button
                onClick={startRecording}
                disabled={disabled}
                size="lg"
                className="gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
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
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                Start Recording
              </Button>
            )}

            {isRecording && (
              <>
                {isPaused ? (
                  <Button
                    onClick={resumeRecording}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Resume
                  </Button>
                ) : (
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </Button>
                )}
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                  Stop
                </Button>
              </>
            )}

            {audioUrl && !isRecording && (
              <Button
                onClick={resetRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
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
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Record Again
              </Button>
            )}
          </div>

          {/* Audio playback preview */}
          {audioUrl && (
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-center text-muted-foreground">
                Preview your recording
              </p>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                aria-label="Recording playback"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive text-center" role="alert">
              {error}
            </div>
          )}

          {/* Helper text */}
          {!isRecording && !audioUrl && (
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Click the button above to start recording your meeting. 
              Make sure to allow microphone access when prompted.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

