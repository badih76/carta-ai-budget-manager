import { z } from 'zod';

// Define the schema for structural parsing validation
export const ReceiptSchema = z.object({
  transType: z.enum(['DB', 'CR']).describe('Transaction type: DB for debit/expense, CR for credit/income/refund'),
  vendorName: z.string().describe('The name of the merchant or store'),
  purchaseDate: z.string().describe('The date of purchase formatted as YYYY-MM-DD or DD MMM YYYY'),
  transMajorCateg: z.string().describe('The is the general major category for the whole receipt to go under.'),
  items: z.array(
    z.object({
      itemName: z.string().describe('The description or name of the individual item'),
      quantity: z.number().describe('The quantity purchased'),
      unitPrice: z.number().describe('The price per individual unit'),
      totalItemPrice: z.number().describe('The total line item price (quantity * unitPrice)'),
      subcategory: z.string().describe('The ID of the selected best matching subcategory.'),
      majorCategory: z.string().describe('The ID of the parent category of the selected best matching subcategory.')
    })
  ),
});

export type ExtractedReceipt = z.infer<typeof ReceiptSchema>;
