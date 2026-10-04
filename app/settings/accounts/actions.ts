// app/actions/accounts.ts
'use server';

import { IAPIResponse } from '@/interfaces/interfaces';
import HttpStatus from '@/lib/HttpStatus';
import { db } from '@/src/drizzle/';
import { accounts, NewDBAccount } from '@/src/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all accounts belonging to a specific user
 */
export async function getAccounts(userId: string): Promise<IAPIResponse> {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: '',
        error: null
    }
    
  try {
    const result = await db.select().from(accounts).where(eq(accounts.userId, userId));

    response.status = HttpStatus.OK;
    response.data = result;

  } catch (error) {
    console.error('Failed to fetch accounts from MySQL:', error);

    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

/**
 * Fetch all accounts belonging to a specific user
 */
export async function getAccountById(accId: string): Promise<IAPIResponse> {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: '',
        error: null
    }
    
  try {
    const result = await db.select().from(accounts).where(eq(accounts.id, accId));

    response.status = HttpStatus.OK;
    response.data = result;

  } catch (error) {
    console.error('Failed to fetch accounts from MySQL:', error);

    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}

/**
 * Create a new account in MySQL
 */
export async function createAccount(data: NewDBAccount): Promise<IAPIResponse> {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: '',
        error: null
    }

    console.log('Account data: ', data);
    
    try {
        const now = new Date();

        // Standardize input format
        const newAccountData: NewDBAccount = {
            ...data,
            balance: data.balance ? data.balance.toString() : '0.00', 
            createdAt: now, updatedAt: now
        };

        // Execute insert query
        const newAccountID = await db.insert(accounts).values(newAccountData).$returningId();

        console.log('New account ID: ', newAccountID[0].id)
        // revalidatePath('/accounts');
        response.status = HttpStatus.OK;
        response.data = { id: newAccountID[0].id, createdAt: now, updatedAt: now };

    } catch (error) {
        console.error('Failed to create account in MySQL:', error);
        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }
    
    return response;
}

/**
 * Delete an account by ID
 */
export async function deleteAccount(id: string, userId: string) {
  try {
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    console.error('Failed deleting account from MySQL:', error);
    return { success: false, error: 'Failed to delete account.' };
  }
}

/**
 * Update an existing account in MySQL
 */
export async function updateAccount(
  id: string,
  userId: string,
  data: Partial<NewDBAccount>
) {
  try {
    const updateData: Partial<NewDBAccount> = { ...data };
    if (data.balance !== undefined) {
      updateData.balance = data.balance.toString();
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    console.error('Failed to update account in MySQL:', error);
    return { success: false, error: 'Database update failed.' };
  }
}