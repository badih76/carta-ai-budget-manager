'use server'

import { IAPIResponse } from "@/interfaces/interfaces";
import HttpStatus from "@/lib/HttpStatus";
import { db } from "@/src/drizzle";
import { NewDBRecurrExpenses, recurringExpenses } from "@/src/drizzle/schema";
import { eq, and, aliasedTable } from "drizzle-orm";

export const getRecurringExpenses = async (userId: string): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const recurrExp = aliasedTable(recurringExpenses, 'recurrExp');

        const results = await db.select().from(recurrExp)
            .where(eq(recurrExp.userId, userId));

        response.status = HttpStatus.OK;
        response.data = results;

    } catch(error) {
        console.log(`There was an error: ${(error as Error).message}.`);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
} 

export const addRecurringExpenses = async (reData: NewDBRecurrExpenses): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    console.log('reData: ', reData);

    try {
        const recExpID = await db.insert(recurringExpenses).values(reData).$returningId();

        response.status = HttpStatus.OK;
        response.data = { newId: recExpID[0].id};

    } catch(error) {
        console.log(`There was an error: ${(error as Error).message}.`);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
} 

export const updateRecurringExpenses = async (reData: Partial<NewDBRecurrExpenses>): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const recurrExp = aliasedTable(recurringExpenses, 'recurrExp');

        const recExpID = await db.update(recurrExp).set(reData).where(and(eq(recurrExp.userId, reData.userId!), eq(recurrExp.id, reData.id!)));

        response.status = HttpStatus.OK;
        response.data = "Success";

    } catch(error) {
        console.log(`There was an error: ${(error as Error).message}.`);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }

    return response;
} 