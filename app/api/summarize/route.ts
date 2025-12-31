import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt } from '@/lib/prompts';
import { SummaryFormat } from '@/types';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, format } = body as { text: string; format: SummaryFormat };

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'No text provided for summarization' },
        { status: 400 }
      );
    }

    if (!format || !['bullet-points', 'action-items', 'structured-table'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid summary format' },
        { status: 400 }
      );
    }

    // Check if Ollama is running
    try {
      const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
      });
      
      if (!healthCheck.ok) {
        throw new Error('Ollama not responding');
      }
      
      // Check if the model is available
      const tagsData = await healthCheck.json();
      const models = tagsData.models || [];
      const modelExists = models.some((m: { name: string }) => 
        m.name === OLLAMA_MODEL || m.name.startsWith(`${OLLAMA_MODEL}:`)
      );
      
      if (!modelExists) {
        return NextResponse.json(
          { 
            error: `Model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}`,
            summary: ''
          },
          { status: 503 }
        );
      }
    } catch {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Ollama. Make sure Ollama is running with `ollama serve`',
          summary: '' 
        },
        { status: 503 }
      );
    }

    // Build the prompt based on format
    const prompt = buildPrompt(format, text);

    // Call Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent output
          top_p: 0.9,
          num_predict: 2048, // Allow longer responses
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      return NextResponse.json(
        { 
          error: `Ollama API error: ${response.statusText}`,
          summary: ''
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.response) {
      return NextResponse.json(
        { 
          error: 'Empty response from Ollama',
          summary: ''
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      summary: data.response.trim(),
    });

  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate summary',
        summary: ''
      },
      { status: 500 }
    );
  }
}

