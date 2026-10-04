'use server'

import { IAPIResponse } from "@/interfaces/interfaces";
import HttpStatus from "@/lib/HttpStatus";
import { db } from "@/src/drizzle";
import { budgetMakerSettings, DBBudgetMakerSettings } from "@/src/drizzle/schema";
import { and, eq } from "drizzle-orm";


export const getSettings = async (userId: string | null): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const result = await db.select().from(budgetMakerSettings)
            .where(eq(budgetMakerSettings.userId, userId!));

        response.status = HttpStatus.OK;
        response.data = result;

    } catch(error) {
        console.error((error as Error).message);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }
    
    return response;
}

export const updateSettings = async (settings: DBBudgetMakerSettings): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const userId = settings.userId;
        const id = settings.id;

        const results = await db.update(budgetMakerSettings).set(settings)
            .where(and(eq(budgetMakerSettings.id, id), eq(budgetMakerSettings.userId, userId)));

        response.status = HttpStatus.OK;
        response.data = JSON.stringify(results);
    } catch(error) {
        console.error((error as Error).message);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }
    
    return response;
}

export const updateSetting = async (id: string, userId: string, data: Partial<DBBudgetMakerSettings>): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    console.log({ id, userId, data });

    try {
        const results = await db.update(budgetMakerSettings).set(data)
            .where(and(eq(budgetMakerSettings.id, id), eq(budgetMakerSettings.userId, userId)));

        response.status = HttpStatus.OK;
        response.data = JSON.stringify(results);
    } catch(error) {
        console.error((error as Error).message);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }
    
    return response;
}

export const addSettings = async (settings: DBBudgetMakerSettings): Promise<IAPIResponse> => {
    let response: IAPIResponse = {
        status: 0,
        data: undefined,
        message: "",
        error: null
    }

    try {
        const userId = settings.userId;
        // const id = settings.id;

        if(!userId || userId == '') {
            response.status = HttpStatus.Unauthorized;
            response.error = 'User is not logged in.';
            return response;
        }

        const results = await db.insert(budgetMakerSettings)
            .values(settings);

        response.status = HttpStatus.OK;
        response.data = JSON.stringify(results);
    } catch(error) {
        console.error((error as Error).message);

        response.status = HttpStatus.Internal;
        response.error = (error as Error).message;
    }
    
    return response;
}
