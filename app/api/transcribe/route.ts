import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(tmpdir(), 'meeting-summarizer');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save file to temp location
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = audioFile.name.split('.').pop() || 'webm';
    tempFilePath = join(tempDir, `audio-${timestamp}.${extension}`);
    
    await writeFile(tempFilePath, buffer);

    // Note: Ollama doesn't natively support Whisper yet
    // This is a placeholder for when it does, or you can use a different approach
    // For now, we'll return a helpful message about setting up transcription
    
    // Try to transcribe using Ollama's audio capabilities (if available)
    // Currently, Ollama doesn't have native audio transcription
    // Users would need to use whisper.cpp or another local solution
    
    // Attempt to check if Ollama is running
    try {
      const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
      });
      
      if (!healthCheck.ok) {
        throw new Error('Ollama not responding');
      }
    } catch {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Ollama. Make sure Ollama is running with `ollama serve`',
          text: '' 
        },
        { status: 503 }
      );
    }

    // For audio transcription, we have a few options:
    // 1. Use whisper.cpp locally (recommended for local-first)
    // 2. Use a browser-based solution like transformers.js
    // 3. Wait for Ollama to support audio models
    
    // Since Ollama doesn't support Whisper directly yet, we'll provide a fallback message
    // In a production app, you'd integrate with whisper.cpp or similar
    
    // Placeholder: Return instruction for manual transcription or integration
    // In real implementation, this would call whisper.cpp or similar
    
    return NextResponse.json({
      text: `[Audio transcription placeholder]

Note: Ollama doesn't natively support audio transcription yet. 
To enable audio transcription, you have a few options:

1. Install whisper.cpp and integrate it with this app
2. Use OpenAI's Whisper API (requires API key)
3. Paste the transcript manually in the text tab

For now, please use the text input to paste your meeting transcript.

Audio file received: ${audioFile.name} (${(audioFile.size / 1024).toFixed(1)} KB)`,
      warning: 'Audio transcription requires additional setup. See message for details.'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
        text: ''
      },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

