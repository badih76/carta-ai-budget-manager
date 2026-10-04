import { IAPIResponse } from '@/interfaces/interfaces';
import { db } from '@/src/drizzle';
import { AIUsageTracker } from '@/src/drizzle/schema';
import { GoogleGenAI } from '@google/genai';
import HttpStatus from '../HttpStatus';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export interface FileAttachment {
  buffer: Buffer;
  mimeType: string; // e.g., 'image/png', 'image/jpeg', 'application/pdf'
}

export interface CalculateTokensInput {
  promptText?: string;
  files?: FileAttachment[];
  modelName?: string; // Defaults to 'gemini-1.5-flash'
}

/**
 * Programmatically calculates input tokens for text and/or file contents
 * prior to executing an AI request.
 */
export async function calculateInputTokens({
  promptText,
  files = [],
  modelName = 'gemini-1.5-flash',
}: CalculateTokensInput): Promise<number> {
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  // Add text prompt part if provided
  if (promptText && promptText.trim().length > 0) {
    parts.push({ text: promptText });
  }

  // Convert attached file buffers to base64 inline parts
  for (const file of files) {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.buffer.toString('base64'),
      },
    });
  }

  if (parts.length === 0) {
    return 0;
  }

  try {
    const response = await ai.models.countTokens({
      model: modelName,
      contents: [{ parts }],
    });

    return response.totalTokens ?? 0;
  } catch (error) {
    console.error('Error calculating token count:', error);
    throw error;
  }
}

export const logAIUsage = async (
    userId: string, prompt: string, 
    inputTokens: number, outputTokens: number, 
    totalTokens: number): Promise<IAPIResponse> => {
        let response: IAPIResponse = {
            status: 0,
            data: undefined,
            message: '',
            error: null
        }

        try {

            const results = await db
                .insert(AIUsageTracker)
                .values({
                    userId: userId,
                    prompt: prompt,
                    inputTokens: inputTokens,
                    outputTokens: outputTokens,
                    totalTokens: totalTokens
                }).$returningId();

            response.data = results;
            response.status = HttpStatus.OK;

        } catch(error) {
            response.error = (error as Error).message;
            response.status = HttpStatus.Internal;
        }

        return response;
    }