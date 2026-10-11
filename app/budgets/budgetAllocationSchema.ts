import { z } from 'zod';

// Define category schema matching your frontend structure
export const categoryAllocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  examples: z.array(z.string()).optional(),
  limit: z.number().describe('Suggested dollar allocation for this category'),
  reasoning: z.string().describe('Brief 1-sentence justification based on average household benchmarks'),
});

export const budgetAllocationResponseSchema = z.object({
  allocations: z.array(categoryAllocationSchema),
  totalAllocated: z.number().describe('Sum of all allocated amounts'),
  summaryNotes: z.string().describe('Short overview of the distribution strategy'),
});