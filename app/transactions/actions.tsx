// app/transactions/actions.ts
'use server';

import { google } from '@ai-sdk/google';
import { generateObject, streamObject } from 'ai';
import { ReceiptSchema } from './receiptSchema';
import { createStreamableValue } from "@ai-sdk/rsc";
import { IAPIResponse } from '@/interfaces/interfaces';
import { db } from '@/src/drizzle';
import { accounts, expenseCategories, NewDBTransactionBreakdown, NewDBTransactions, transactionBreakdown, transactions } from '@/src/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import HttpStatus from '@/lib/HttpStatus';
import { logAIUsage } from '@/lib/aiUtils';

type Role = 'system' | 'user' | 'assistant' | 'tool';
const role = 'user';

interface ICreateTransactionProps {
    userId: string,
    accountId: string,
    amount: string,
    balance: string,
    type: 'DB' | 'CR',
    category: string,
    notes: string,
    effectDate: Date,
}

export async function parseReceiptAction(formData: FormData) {
    const streamable = createStreamableValue();
    let success: boolean = true;
    let error: string = '';
    

    try {
        const userId = formData.get('userId') as string;
        const purpose = formData.get('purpose') as string;
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file payload found');

        // Convert File object to buffer and generate base64 data for multimodal context
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');
        const mimeType = file.type;

        
        const categories = await db.select({
                id: expenseCategories.id,
                level: expenseCategories.level,
                name: expenseCategories.name,
                description: expenseCategories.description
            })
            .from(expenseCategories)
            .where(and(eq(expenseCategories.userId, userId), eq(expenseCategories.purpose, purpose)));


        const formattedCategories = categories.map(cat => 
            `[${cat.level.toUpperCase()}] ID: ${cat.id} | Name: ${cat.name}${cat.description ? ` | Info: ${cat.description}` : ''}`
            ).join('\n');    

        const prompt = `
            Analyze this receipt image or invoice document. Extract the vendor name, transaction date, total amount, and all individual line items accurately.

            CRITICAL - Slanted Baseline & Curved Receipt Tracking:
            - Non-Linear Row Tracing: The paper receipt is physically curved or bent. Do NOT use a rigid, flat horizontal line to match items to prices. 
            - Following Text Baselines: Visually trace the physical printed line or imaginary text baseline from the start of the item description on the left across to the price column on the right, following any curve, tilt, or slant in the paper fold.
            - Row Continuity Verification: If a paper fold causes the right side of a text row to shift higher or lower than the left side, follow that slanted trajectory. Ensure the price you extract strictly belongs to the exact same continuous row block as the item name, preventing column drift caused by paper distortion.

            CRITICAL - Promotional Lines & Modifier Row Handling:
            - Multi-Buy & Discount Sub-Rows: Australian supermarket receipts frequently contain promotional modifier lines (e.g., bold headers like "HUGGIES BABY WIPES 2 FOR $7" or offset savings lines like "-$4.00", "2 @ $2.00 EACH"). 
            - These modifier lines are NOT standalone products. Do NOT extract promotional discount lines or multi-buy headers as separate line items. Ignore floating discount amounts when mapping item prices.
            
            Transaction Type Determination:
            - Set "transType" to "DB" if this document represents an expense, purchase, bill, or money paid out (Debit).
            - Set "transType" to "CR" if this document represents an income, refund, payout, or money received (Credit).
            - The "transType" MUST be strictly either "DB" or "CR".

            Available Categories Context:
            ${formattedCategories}

            Instructions for line item categorization:
            1. For each extracted line item, select the single best matching SUBCATEGORY from the provided categories list (where level === 'sub').
            2. Set the line item's subcategory ID to the selected subcategory's "id".
            3. Set the line item's major category ID to that subcategory's "parent" value (linking it directly to its parent major category ID).
            4. If no subcategory fits, select the best fitting MAJOR category (where level === 'major') for both fields or fall back to your best match from the provided taxonomy. Do NOT invent new IDs outside the provided list.

            After parsing the receipt, decide what is the general major category under which this receipt should be based on the parced receipt item nature, categories and type(s) and return its ID in transMajorCateg. Do not return the category name.
            Major categories are categories with level = 'major' while subcategories are categories with level = 'sub'.
            `.trim();

        (async () => {
            try {
                // FIX 2: Correct streamObject parameters mapping to respect Core vs Provider boundaries
                const { partialObjectStream, usage } = await streamObject({
                    // Use model-specific tools or option parameters provided by Vercel's Google package
                    model: google(process.env.GEMINI_AI_MODEL ?? 'gemini-2.5-flash'),
                    schema: ReceiptSchema,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { 
                                    type: 'file', 
                                    data: base64Data, // Strictly formatted Uint8Array resolves type 'ImagePart' errors
                                    mediaType: file.type 
                                }
                            ]
                        }
                    ]
                });

                for await (const partialObject of partialObjectStream) {
                    streamable.update(partialObject);
                }

                // await applyTokenCharge(user.id, 'COLCHK01');
                // streamable.done();

                const iTokens = (await usage).inputTokenDetails;
                const oTokens = (await usage).outputTokens;
                const tTokens = (await usage).totalTokens;

                const iTokensTotal = (iTokens.noCacheTokens ?? 0) + (iTokens.cacheReadTokens ?? 0) + (iTokens.cacheWriteTokens ?? 0);

                console.log('Input (Prompt) Tokens:', iTokens);
                console.log('Output (Completion) Tokens:', oTokens);
                console.log('Total Tokens:', tTokens);

                const logResults = await logAIUsage(userId, prompt, iTokensTotal, oTokens ?? 0, tTokens ?? 0);

                if(logResults.status != HttpStatus.OK) 
                    console.log(`There was an error. ${logResults.error!}.`);

            } catch (streamError: any) {
                console.error("Stream compilation failed:", streamError);
                streamable.error(streamError);
                error = streamError;
                success = false;
            } finally {
                streamable.done();
            }
        })();

        return { success: true, data: streamable.value };
    } catch (error: any) {
        console.error('Receipt Extraction Error:', error);
        
        try {
            // Safely push the error state to the client stream.
            // Use streamable.update() if your UI expects an object, 
            // or streamable.error() if you are using AI SDK error handling.
            streamable.update({ 
                success: false, 
                error: error.message || 'Failed to process document' 
            });
            error = error.message || 'Failed to process document';
            success = false;
        } catch (streamFailError) {
            // The stream timed out and closed before we could send the error
            console.error("Could not send error to client: stream already closed.");
            error = streamFailError || "Could not send error to client: stream already closed.";
            success = false;
        }
        
        streamable.done();

        return { success, data: streamable.value, error };
    } 
}

export const getTransactionsByAccountId = async (userId: string, accountId: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: '',
        error: null
    }

    console.log({ userId, accountId });

    try {
        const results = await db.select().from(transactions)
            .where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountId)));

        response.status = HttpStatus.OK;
        response.data = results;
    } catch(error) {
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
}

export const createTransactionAction = async ({ 
    userId, accountId, amount, balance, type, category, notes, effectDate
 }: ICreateTransactionProps) => {
    try {
        return { success: true };
    } catch(error) {
        return { success: false, error: 'Failed to create transaction record' };
    }
    
}

export const getCategories = async (userId: string | null, purpose: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: '',
        error: null
    }
    
    try {
        if(userId == null) 
            throw new Error('Invalid user ID.');

        const categories = await db.select({
                id: expenseCategories.id,
                level: expenseCategories.level,
                name: expenseCategories.name,
                description: expenseCategories.description,
                examples: expenseCategories.examples,
                parent: expenseCategories.parent
            })
            .from(expenseCategories)
            .where(and(eq(expenseCategories.userId, userId), eq(expenseCategories.purpose, purpose)));

        response.data = categories;
        response.status = HttpStatus.OK;

    } catch(error) {
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
}

export const saveNewTransactionsAndBreakdowns = async (
    userId: string,
    accountId: string,
    transactionsToSave: NewDBTransactions[], 
    transactionsBreakdownToSave: NewDBTransactionBreakdown[]): Promise<IAPIResponse> => {
        let response: IAPIResponse = {
            status: 0,
            data: undefined,
            message: '',
            error: null
        }

        try {
            // fetch the account balance...
            const accResult = await db.select({
                    balance: accounts.balance
                })
                .from(accounts)
                .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

            if(accResult.length < 1)
                throw new Error('The provided account is not found!');

            const initBalance = parseFloat(accResult[0].balance);
            let remBalance = initBalance;

            // update the balance property of each transaction...
            transactionsToSave.forEach(t => {
                // If transaction is DB, reduce balance by transaction amount, else, increase by transaction amount...
                const tBalance: number = remBalance + (t.type == 'DB' ? (parseFloat(t.amount!) * -1) : parseFloat(t.amount!));
                t.balance = tBalance.toString();
                remBalance = tBalance;
            });

            // save transactions...
            const transResults = await db.insert(transactions).values(transactionsToSave);

            // save transactions breakdown...
            const transBDResults = await db.insert(transactionBreakdown).values(transactionsBreakdownToSave);

            const updateResult = await db.update(accounts)
                .set({ 
                    balance: remBalance.toString()
                })
                .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

            response.status = HttpStatus.OK;
            response.data = JSON.stringify({ transactions: transResults, transBreakdown: transBDResults, accBalance: remBalance, accBalUpdate: updateResult });

        } catch(error) {
            response.status = HttpStatus.Internal;
            response.error = (error as Error).message;
        }

        return response;
    }

    export const getTransactionBreakdown = async (transactionId: string): Promise<IAPIResponse> => {
        let response: IAPIResponse = {
            status: 0,
            data: undefined,
            message: '',
            error: null
        }

        try {
            const results = await db.select().from(transactionBreakdown).where(eq(transactionBreakdown.transactionId, transactionId));

            response.status = HttpStatus.OK;
            response.data = results;
        } catch(error) {
            response.status = HttpStatus.Internal;
            response.error = (error as Error).message;
        }

        return response;
    }