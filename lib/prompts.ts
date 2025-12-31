import { SummaryFormat } from '@/types';

const SYSTEM_CONTEXT = `You are an expert meeting summarizer. You analyze meeting transcripts and extract the most important information in a clear, organized manner. Focus on key decisions, action items, and important discussion points.`;

export const FORMAT_PROMPTS: Record<SummaryFormat, string> = {
  'bullet-points': `${SYSTEM_CONTEXT}

Summarize the following meeting transcript into clear, hierarchical bullet points. Group related topics together. Use main bullets for major topics and sub-bullets for details.

Format your response as:
• Main Topic 1
  - Key point
  - Key point
• Main Topic 2
  - Key point
  - Key point

Meeting Transcript:
`,

  'action-items': `${SYSTEM_CONTEXT}

Extract all action items from the following meeting transcript. For each action item, identify:
1. The task that needs to be done
2. The person responsible (if mentioned)
3. The deadline (if mentioned)
4. Priority level (High/Medium/Low based on context)

Format your response as:
ACTION ITEMS:

1. [Task description]
   • Owner: [Name or "Unassigned"]
   • Deadline: [Date or "Not specified"]
   • Priority: [High/Medium/Low]

2. [Next task...]

Meeting Transcript:
`,

  'structured-table': `${SYSTEM_CONTEXT}

Organize the following meeting transcript into a structured format with clear sections. Include:
1. Meeting Overview (brief summary in 2-3 sentences)
2. Key Topics Discussed (with brief descriptions)
3. Decisions Made
4. Open Questions/Concerns
5. Next Steps

Format your response clearly with headers and organized content under each section.

Meeting Transcript:
`,
};

export function buildPrompt(format: SummaryFormat, transcript: string): string {
  return FORMAT_PROMPTS[format] + transcript;
}

