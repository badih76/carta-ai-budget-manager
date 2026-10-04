import { z } from 'zod';

// We want a clean array of strings returned from the model
export const CategoryListSchema = z.object({
  categories: z.array(
    z.string().describe('A concise, distinct expense category name (e.g., Marketing, Groceries, Inventory, Electricity)')
  ),
});

// Strict schema validation layout matching the expanded metadata request
export const DetailedCategorySchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().default('').describe('This is generated at save time. Can be kept empty.'),
      name: z.string().describe('Short, distinct expense category name (e.g., Software SaaS, Office Logistics, Groceries)'),
      description: z.string().describe('A clear, brief summary explaining what this budget vertical covers.'),
      examples: z.array(z.string()).describe('3-4 common real-world examples of items that fall into this envelope.'),
      level: z.string().describe('State whether this category is a major category or a subcategory of a major category. It can be either "major" or "sub"'),
      parent: z.string().describe('This is the major category ID under which a sub-category would go.')
    })
  ),
});

export type AIExpenseCategory = z.infer<typeof DetailedCategorySchema>['categories'][number];
export type UAIExpenseCategory = AIExpenseCategory & { isSaved: boolean } 