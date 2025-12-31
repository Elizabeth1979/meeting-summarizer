'use client';

import { useCallback, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './AudioRecorder';

interface AudioInputProps {
  onAudioReady: (blob: Blob) => void;
  audioBlob: Blob | null;
  disabled?: boolean;
}

export function AudioInput({ onAudioReady, audioBlob, disabled }: AudioInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/webm', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
    const isValidType = validTypes.some(type => file.type === type) || 
      /\.(mp3|wav|webm|m4a|mp4)$/i.test(file.name);
    
    if (!isValidType) {
      console.error('Invalid audio file type');
      return;
    }

    // Clean up previous URL
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
    }

    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedUrl(url);

    // Convert file to blob and pass to parent
    file.arrayBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: file.type });
      onAudioReady(blob);
    });
  }, [onAudioReady, uploadedUrl]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleClearUpload = useCallback(() => {
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
    }
    setUploadedFile(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedUrl]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Tabs defaultValue="record" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="record" className="gap-2">
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
          Record
        </TabsTrigger>
        <TabsTrigger value="upload" className="gap-2">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Upload
        </TabsTrigger>
      </TabsList>

      <TabsContent value="record" className="mt-4">
        <AudioRecorder 
          onRecordingComplete={onAudioReady}
          disabled={disabled}
        />
      </TabsContent>

      <TabsContent value="upload" className="mt-4">
        <Card className={`transition-all duration-200 ${isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
          <CardContent className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="flex flex-col items-center justify-center space-y-4"
            >
              {!uploadedFile ? (
                <>
                  <div className="p-4 rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0" />
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">
                      Drag and drop an audio file here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.webm,.m4a,.mp4"
                    onChange={handleInputChange}
                    className="hidden"
                    id="audio-upload"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    Select Audio File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Supports MP3, WAV, WebM, M4A files
                  </p>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
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
                          className="text-primary"
                        >
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearUpload}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive"
                    >
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
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                  {uploadedUrl && (
                    <audio
                      src={uploadedUrl}
                      controls
                      className="w-full"
                      aria-label="Uploaded audio preview"
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

