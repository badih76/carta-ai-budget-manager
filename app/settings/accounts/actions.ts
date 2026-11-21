// app/actions/accounts.ts
'use server';

import { IAPIResponse } from '@/interfaces/interfaces';
import HttpStatus from '@/lib/HttpStatus';
import { db } from '@/src/drizzle/';
import { accounts, NewDBAccount, transactions } from '@/src/drizzle/schema';
import { eq, and, sum } from 'drizzle-orm';
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

export const balanceAccount = async (userId: string, accountId: string): Promise<IAPIResponse> => {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    // get the sum of CR transactions of this user's account
    const crTransactions = await db.select({
      totalCr: sum(transactions.amount)
    }).from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountId), eq(transactions.type, 'CR')));

    // get the sum of DB transactions of this user's account
    const dbTransactions = await db.select({
      totalDb: sum(transactions.amount)
    }).from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountId), eq(transactions.type, 'DB')));

    let totalCr = 0;
    if(crTransactions.length > 0 && crTransactions[0].totalCr)
      totalCr = parseFloat(crTransactions[0].totalCr);
    else 
      totalCr = 0;

    let totalDb = 0;
    if(dbTransactions.length > 0 && dbTransactions[0].totalDb)
      totalDb = parseFloat(dbTransactions[0].totalDb);
    else 
      totalDb = 0;

    console.log({ totalCr, totalDb });

    // Calculate the new account balance
    const newBalance = totalCr - totalDb;

    // Update the account balance
    const updateBalance = await db.update(accounts)
      .set({
        balance: newBalance.toString()
      }).where(and(eq(accounts.userId, userId), eq(accounts.id, accountId)));

    // Check affected / changed rows count. Must be 1
    console.log({ affected: updateBalance[0].affectedRows, changed: updateBalance[0].changedRows, serverStatus: updateBalance[0].serverStatus })
    
    response.data = { newBalance: newBalance };
    response.status = HttpStatus.OK;

  } catch(error) {
    response.error = (error as Error).message;
    response.status = HttpStatus.Internal;
  }

  return response;
}