'use server'

import { IAPIResponse } from "@/interfaces/interfaces"
import HttpStatus from "@/lib/HttpStatus"
import { db } from "@/src/drizzle"
import { DBExpenseBudgets, DBExpenseCategory, expenseBudgets, NewDBExpenseBudgets } from "@/src/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { getExpenseCategories } from "../settings/expenseCategories/actions"
import { TExpenseCategBudget } from "./types"
import { createStreamableValue } from "@ai-sdk/rsc"
import { streamObject } from 'ai';
import { budgetAllocationResponseSchema } from "./budgetAllocationSchema"
import { google } from "@ai-sdk/google"


export const addExpenseBudget = async (expenseBudgetData: NewDBExpenseBudgets): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {

        const results = await db.insert(expenseBudgets)
            .values(expenseBudgetData).$returningId();

        console.log('New Budget: ', results[0]);

        response.status = HttpStatus.OK;
        response.data = { newBudget: results[0] };

    } catch(error) {
        console.error('Failed to create account in MySQL:', error);
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
}

export const getExpenseBudgets = async (userId: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }
    
    try {
        const results = await db.select().from(expenseBudgets).where(eq(expenseBudgets.userId, userId));

        response.status = HttpStatus.OK;
        response.data = results;

    } catch(error) {
        console.error('Failed to create account in MySQL:', error);
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
}

export const saveExpenseBudget = async (budgetData: NewDBExpenseBudgets | DBExpenseBudgets, isNew: boolean = false): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    if(isNew) {
        // prepare a new DBExpenseBudget object for insertion...
        let newBudget: NewDBExpenseBudgets = {
            name: budgetData.name,
            userId: budgetData.userId,
            expenseCateg: budgetData.expenseCateg,
            accountId: budgetData.accountId,
            initAllocatedAmount: budgetData.initAllocatedAmount,
            breakdown: ''
        }

        // create a new list of expenses categories from the assigned expenses categories lits ID (expenseCateg)...
        try {
            // 1. Get the categories in the assigned expense category list:
            const expCategResults = await getExpenseCategories(budgetData.userId, budgetData.expenseCateg);

            if(expCategResults.status != HttpStatus.OK)
                throw new Error(expCategResults.error!);

            // 2. Create a list of budgeted expense categories...
            let newBudgetedCategs: TExpenseCategBudget[] = [];

            expCategResults.data.map((ec: DBExpenseCategory) => {
                const budgetedCateg: TExpenseCategBudget = {
                    id: ec.id,
                    category: ec.id,
                    limit: 0,
                    description: ec.description,
                    examples: ec.examples ?? ''
                }

                newBudgetedCategs.push(budgetedCateg);
            });

            // 3. Stringify the array of budgeted categories to be included in the new budget object which will be inserted...
            const stringifiedExpenseCateg = JSON.stringify(newBudgetedCategs);
            newBudget.breakdown = stringifiedExpenseCateg;

            // 4. Insert the new budget into the expense budgets table...
            const dbInsertResults = await db.insert(expenseBudgets).values(newBudget).$returningId();

            const dbSelectResults = await db.select().from(expenseBudgets).where(eq(expenseBudgets.id, dbInsertResults[0].id));

            // 5. Return the insterted row data...
            response.status = HttpStatus.OK;
            response.data = dbSelectResults;

        } catch(error) {
            response.status = HttpStatus.Internal;
            response.error = (error as Error).message;
        }

    } else {
        // update an already existing budget...

        console.log(typeof budgetData.breakdown, budgetData.breakdown);
        try {
            const dbUpdateResults = await db.update(expenseBudgets)
                .set({
                    breakdown: budgetData.breakdown
                })
                .where(and(eq(expenseBudgets.userId, budgetData.userId), eq(expenseBudgets.id, budgetData.id!)));

            response.status = HttpStatus.OK;
            response.data = { updateResult: JSON.stringify(dbUpdateResults) };
            
        } catch(error) {
            response.status = HttpStatus.Internal;
            response.error = (error as Error).message;
        }
            
    }

    return response;
}

export async function generateBudgetAllocationsStream(
  categories: TExpenseCategBudget[],
  totalAmount: number
) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const { partialObjectStream } = await streamObject({
        model: google('gemini-2.5-flash'), // or your preferred model
        schema: budgetAllocationResponseSchema,
        prompt: `
            You are an expert financial advisor and household budgeting specialist.

            Your task is to distribute a total expenditure allowance of **$${totalAmount.toFixed(2)}** across the following household expense categories:

            CATEGORIES:
            ${JSON.stringify(categories, null, 2)}

            REQUIREMENTS:
            1. Benchmark allocations against typical Australian household spending averages (e.g., standard ratios like 30-35% Housing/Utilities, 15-20% Food/Household, 10-15% Transportation, 10-15% Savings, 10-15% Discretionary, 5-10% Health).
            2. The SUM of all suggested "allocatedAmount" values MUST equal EXACTLY **$${totalAmount.toFixed(2)}**. Do not leave unallocated funds and do not exceed the limit.
            3. Keep category IDs and names unchanged from the input array.
            4. Provide a brief 1-sentence reasoning for each allocation based on average household benchmarks.
        `,
      });

      for await (const partialObject of partialObjectStream) {
        stream.update(partialObject);
      }

      stream.done();
    } catch (error) {
      console.error('Failed to stream AI budget allocation:', error);
      stream.error(error);
    }
  })();

  return { output: stream.value };
}

export const getBudgetById = async (budgetId: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const result = await db.select().from(expenseBudgets).where(eq(expenseBudgets.id, budgetId));

        response.status = HttpStatus.OK;
        response.data = result;
    } catch(error) {
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
}