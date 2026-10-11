// app/categories/actions.ts
'use server';

import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { createStreamableValue } from "@ai-sdk/rsc";
import { AIIncomeCategory, CategoryListSchema, DetailedCategorySchema } from "./categoriesListSchema";
import { IAPIResponse } from '@/interfaces/interfaces';
import HttpStatus from '@/lib/HttpStatus';
import { db } from '@/src/drizzle';
import { accounts, incomeCategories, NewDBIncomeCategory, transactions } from '@/src/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { uuid } from 'uuidv4';
import { purposePrompts } from './types';

export type ActionStreamResponse = {
  success: boolean;
  output?: any;
  error?: string;
};

export async function generateSubCategoriesAction(
  purposeKey: string,
  majorCategory: AIIncomeCategory,
  existingSubCategories: AIIncomeCategory[] = []
): Promise<ActionStreamResponse> {
  try {
    const stream = createStreamableValue();
    const targetContext = purposePrompts[purposeKey] || "General asset financial tracking.";

    const hasExisting = existingSubCategories && existingSubCategories.length > 0;

    const existingSubCategoriesContext = hasExisting
      ? existingSubCategories
          .map((c) => {
            const exList = Array.isArray(c.examples)
              ? c.examples.join(', ')
              : typeof c.examples === 'string'
                ? c.examples
                : '';
            return `- Name: "${c.name}"\n  Description: "${c.description || 'N/A'}"\n  Examples: [${exList}]`;
          })
          .join('\n')
      : 'None provided.';

    const majorCategoryContext = `
      Major Category Name: "${majorCategory.name}"
      Description: "${majorCategory.description || 'N/A'}"
      Examples: [${
        Array.isArray(majorCategory.examples)
          ? majorCategory.examples.join(', ')
          : majorCategory.examples || ''
      }]
    `;

    const dynamicPrompt = `
      You are a financial budgeting expert.

      Analyze this baseline domain: ${targetContext}

      PARENT MAJOR CATEGORY CONTEXT:
      ${majorCategoryContext}

      ${
        hasExisting
          ? `TASK: Generate a complete merged list containing ALL existing subcategories AND new suggested subcategories under the Parent Major Category.

      --- EXISTING SUBCATEGORIES ---
      ${existingSubCategoriesContext}

      --- STRICT INSTRUCTIONS ---
      1. Re-include all existing subcategories provided above in your generated output list without altering their names or core descriptions.
      2. Suggest ADDITIONAL subcategories that fit under the Parent Major Category.
      3. DO NOT suggest any new subcategory that duplicates or overlaps with the existing subcategories.
      4. Output the existing subcategories followed by the new subcategories as ONE unified array in the 'categories' field.`
          : `TASK: Generate a comprehensive, complete baseline list of subcategories specifically for the Parent Major Category described above.`
      }

      --- OUTPUT REQUIREMENTS ---
      For each subcategory item element generated, provide an accurate unique name, a clear description, and 3-4 highly relevant examples.
    `;

    (async () => {
      const { partialObjectStream } = await streamObject({
        model: google('gemini-2.5-flash'),
        schema: DetailedCategorySchema,
        prompt: dynamicPrompt,
      });

      for await (const partial of partialObjectStream) {
        if (partial?.categories) {
          stream.update(partial.categories);
        }
      }
      stream.done();
    })();

    return { success: true, output: stream.value };
  } catch (error: unknown) {
    console.error('Subcategory Context Stream Failure:', error);
    const msg =
      error instanceof Error
        ? error.message
        : 'Failed initializing detailed subcategory AI extraction streams.';
    return { success: false, error: msg };
  }
}

export async function generatePurposeCategoriesActionEx(
  purposeKey: string,
  existingCategories: AIIncomeCategory[] = []
): Promise<ActionStreamResponse> {
  try {
    const stream = createStreamableValue();
    const targetContext = purposePrompts[purposeKey] || "General asset financial tracking.";

    // Format existing categories for clear AI parsing
    // 1. Format existing categories string & determine mode
    const hasExisting = existingCategories && existingCategories.length > 0;

    const existingCategoriesContext = hasExisting
      ? existingCategories
          .map((c) => {
            const exList = Array.isArray(c.examples)
              ? c.examples.join(', ')
              : typeof c.examples === 'string'
                ? c.examples
                : '';
            return `- Name: "${c.name}"\n  Description: "${c.description || 'N/A'}"\n  Examples: [${exList}]`;
          })
          .join('\n')
      : 'None provided.';

    // 2. Build the dynamic prompt with dedicated mode instructions
    const dynamicPrompt = `
    You are a financial budgeting expert.

    Analyze this baseline domain: ${targetContext}

    ${
      hasExisting
        ? `TASK: Suggest ADDITIONAL major income categories that are missing from the user's current setup.

    --- EXISTING CATEGORIES (DO NOT DUPLICATE) ---
    The user already has the following categories defined:
    ${existingCategoriesContext}

    --- STRICT INSTRUCTIONS ---
    1. DO NOT suggest any category that duplicates or strongly overlaps with the existing categories listed above (by name, scope, or broad financial concept).
    2. Focus strictly on filling gaps in the budgeting taxonomy that are not yet covered.`
        : `TASK: Generate a comprehensive, complete baseline list of major income categories suitable for this domain.`
    }

    --- OUTPUT REQUIREMENTS ---
    For each category item element generated, provide an accurate unique name, a clear description, and 3-4 highly relevant examples.
    `;

    (async () => {
      const { partialObjectStream } = await streamObject({
        model: google('gemini-2.5-flash'),
        schema: DetailedCategorySchema,
        prompt: dynamicPrompt,
      });

      for await (const partial of partialObjectStream) {
        if (partial?.categories) {
          stream.update(partial.categories);
        }
      }
      stream.done();
    })();

    return { success: true, output: stream.value };
  } catch (error: unknown) {
    console.error('Detailed Category Stream Failure:', error);
    const msg = error instanceof Error ? error.message : 'Failed initializing detailed AI context extraction streams.';
    return { success: false, error: msg };
  }
}

export const getIncomeCategories = async (userId: string, purpose: string, type: string = ''): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    const results = await db.select().from(incomeCategories)
      .where(and(eq(incomeCategories.userId, userId), eq(incomeCategories.purpose, purpose)));

    response.status = HttpStatus.OK;
    response.data = results;

  } catch(error) {
    console.log(`There was an error: ${(error as Error).message}.`);
    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

export const saveMajorIncomeCategories = async (
  userId: string,
  purpose: string, 
  categories: AIIncomeCategory[]
): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
      status: 0,
      data: undefined,
      message: '',
      error: null
    }

    // prepare the data to be saved
    const dbCategories: NewDBIncomeCategory[] = categories.map((c) => {
      const id = c.id && c.id !== '' ? c.id : uuid();
      return ( 
        {
          id: id,
          userId: userId,
          name: c.name,
          description: c.description,
          purpose: purpose,
          examples: JSON.stringify(c.examples),
          level: 'major',
          parent: id
        })
    });

    try {

      // 2. Execute deletion and re-insertion atomically inside a transaction
      const results = await db.transaction(async (tx) => {
        // Step A: Wipe old categories matching both the userId AND purpose
        await tx
          .delete(incomeCategories)
          .where(
            and(
              eq(incomeCategories.userId, userId),
              eq(incomeCategories.purpose, purpose),
              eq(incomeCategories.level, 'major')
            )
          );

        // Step B: Insert the freshly generated/edited category set
        if (dbCategories.length > 0) {
          const inserted = await tx
            .insert(incomeCategories)
            .values(dbCategories)
            .$returningId();

            return { success: true, count: inserted.length };
        }

        return { success: true, count: 0 };
      })

      response.status = HttpStatus.OK;
      response.data = results;

    } catch(error) {
      console.error(`An error occured: ${(error as Error).message}.`);

      response.status = HttpStatus.Internal;
      response.error = (error as Error).message;
    }

    return response;
}

export const saveMajorIncomeCategoriesV2 = async (
  userId: string,
  purpose: string,
  categories: AIIncomeCategory[]
): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null,
  };

  try {
    const results = await db.transaction(async (tx) => {
      // 1. Fetch current DB categories for this user, purpose, and level
      const existingDbCategories = await tx
        .select({ id: incomeCategories.id })
        .from(incomeCategories)
        .where(
          and(
            eq(incomeCategories.userId, userId),
            eq(incomeCategories.purpose, purpose),
            eq(incomeCategories.level, 'major')
          )
        );

      const existingDbIds = existingDbCategories.map((c) => c.id);

      // 2. Prepare payload items into UPDATE and INSERT groups
      const toUpdate: NewDBIncomeCategory[] = [];
      const toInsert: NewDBIncomeCategory[] = [];
      const incomingIds: string[] = [];

      for (const c of categories) {
        const id = c.id && c.id !== '' ? c.id : uuid();
        incomingIds.push(id);

        const categoryPayload: NewDBIncomeCategory = {
          id: id,
          userId: userId,
          name: c.name,
          description: c.description,
          purpose: purpose,
          examples: JSON.stringify(c.examples),
          level: 'major',
          parent: id,
        };

        if (existingDbIds.includes(id)) {
          toUpdate.push(categoryPayload);
        } else {
          toInsert.push(categoryPayload);
        }
      }

      // 3. Update existing categories in-place
      for (const item of toUpdate) {
        await tx
          .update(incomeCategories)
          .set({
            name: item.name,
            description: item.description,
            examples: item.examples,
            parent: item.parent,
          })
          .where(
            and(
              eq(incomeCategories.id, item.id!),
              eq(incomeCategories.userId, userId)
            )
          );
      }

      // 4. Insert new categories
      if (toInsert.length > 0) {
        await tx.insert(incomeCategories).values(toInsert);
      }

      // 5. Handle removed categories (present in DB, missing from incoming array)
      const orphanDbIds = existingDbIds.filter((id) => !incomingIds.includes(id));

      if (orphanDbIds.length > 0) {
        // Query IDs that have associated transactions
        const linkedTransactions = await tx
          .selectDistinct({ categoryId: transactions.category })
          .from(transactions)
          .where(inArray(transactions.category, orphanDbIds));

        const linkedCategoryIds = new Set(
          linkedTransactions.map((t) => t.categoryId)
        );

        // Filter out categories that are safe to delete (not linked to any transaction)
        const safeToDeleteIds = orphanDbIds.filter(
          (id) => !linkedCategoryIds.has(id)
        );

        if (safeToDeleteIds.length > 0) {
          await tx
            .delete(incomeCategories)
            .where(inArray(incomeCategories.id, safeToDeleteIds));
        }
      }

      return {
        success: true,
        updatedCount: toUpdate.length,
        insertedCount: toInsert.length,
      };
    });

    response.status = HttpStatus.OK;
    response.data = results;
  } catch (error) {
    console.error(`An error occurred: ${(error as Error).message}.`);

    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
};

export const saveIncomeCategories = async (
  userId: string,
  purpose: string, 
  categories: AIIncomeCategory[],
  categLevel: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
      status: 0,
      data: undefined,
      message: '',
      error: null
    }

    // prepare the data to be saved
    const dbCategories: NewDBIncomeCategory[] = categories.map((c) => {
      const id = uuid();
      return ( 
        {
          id: id,
          userId: userId,
          name: c.name,
          description: c.description,
          purpose: purpose,
          examples: JSON.stringify(c.examples),
          level: categLevel,
          parent: c.parent
        })
  });

    try {

      // 2. Execute deletion and re-insertion atomically inside a transaction
      const results = await db.transaction(async (tx) => {
        // Step A: Wipe old categories matching both the userId AND purpose
        await tx
          .delete(incomeCategories)
          .where(
            and(
              eq(incomeCategories.userId, userId),
              eq(incomeCategories.purpose, purpose),
              eq(incomeCategories.level, categLevel)
            )
          );

        // Step B: Insert the freshly generated/edited category set
        if (dbCategories.length > 0) {
          const inserted = await tx
            .insert(incomeCategories)
            .values(dbCategories)
            .$returningId();

            return { success: true, count: inserted.length };
        }

        return { success: true, count: 0 };
      })

      response.status = HttpStatus.OK;
      response.data = results;

    } catch(error) {
      console.error(`An error occured: ${(error as Error).message}.`);

      response.status = HttpStatus.Internal;
      response.error = (error as Error).message;
    }

    return response;
}

export const getIncomesCategoriesPurposes = async (userId: string): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    const result = await db
      .selectDistinct({      
        purpose: incomeCategories.purpose
      })
      .from(incomeCategories)
      .where(eq(incomeCategories.userId, userId));

    response.status = HttpStatus.OK;
    response.data = result;

  } catch(error) {
    console.log(`Error: ${(error as Error).message}`);

    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

export const getIncomeCategoryNameById = async (userId: string, categId: string): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    const result = await db.select({
        name: incomeCategories.name
      }).from(incomeCategories)
      .where(and(eq(incomeCategories.userId, userId), eq(incomeCategories.id, categId)));

      response.status = HttpStatus.OK;
      
      if(result.length > 0) {
        response.data = result[0].name;
      } else {
        response.data = 'Income Category Not Found!';
      }
  } catch(error) {
    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

export async function getCategoryMap(userId: string, accountId: string): Promise<IAPIResponse> {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    const categories = await db
      .select({
        id: incomeCategories.id,
        name: incomeCategories.name,
      })
      .from(incomeCategories)
      .innerJoin(accounts, eq(accounts.incomeCateg, incomeCategories.purpose))
      .where(and(eq(incomeCategories.userId, userId), eq(accounts.id, accountId)));
      
    // Convert array of categories into a dictionary/map: { "cat_123": "Groceries", "cat_456": "Utilities" }
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      categoryMap[cat.id] = cat.name;
    }

    response.status = HttpStatus.OK;
    response.data = categoryMap;
    
  } catch (error) {
    console.error('Failed to fetch category map:', error);
    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

export const getIncomeCategoriesPurposes = async (userId: string): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    const result = await db
      .selectDistinct({      
        purpose: incomeCategories.purpose
      })
      .from(incomeCategories)
      .where(eq(incomeCategories.userId, userId));

    response.status = HttpStatus.OK;
    response.data = result;

  } catch(error) {
    console.log(`Error: ${(error as Error).message}`);

    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}