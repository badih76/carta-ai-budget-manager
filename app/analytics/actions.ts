'use server';

import { db } from '@/src/drizzle'; // Adjust to your actual Drizzle DB instance import
import { 
  transactions, 
  transactionBreakdown, 
  recurringExpenses, 
  accounts,
  AIUsageTracker, 
  expenseBudgets,
  expenseCategories,
  incomeCategories
} from '@/src/drizzle/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google'; // Or your preferred AI provider
import { IAPIResponse } from '@/interfaces/interfaces';
import HttpStatus from '@/lib/HttpStatus';
import { unionAll } from 'drizzle-orm/mysql-core';


// {"id":"39b0492d-b534-4dd5-b9a1-bef5bdcd4b82","category":"Discretionary & Lifestyle","limit":553.5},
interface IBudgetItem {
    id: string,
    category: string,
    limit: number
}

export async function askLedgerAI(query: string, userId: string = 'demo-user') {
  const { text, usage } = await generateText({
    model: google('gpt-4o'),
    system: "You are a financial AI assistant parsing database ledger questions. Provide a short, direct answer summarizing expenses.",
    prompt: query,
  });

  // Track AI Usage to database
  await db.insert(AIUsageTracker).values({
    userId,
    prompt: query,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  });

  return { answer: text };
}

export async function fetchAnalyticsData(accountId: string, dateRange: string, userId: string = 'demo-user') {
  // 1. Fetch Current Cash Balance
  const accountQuery = accountId === 'all' 
    ? db.select({ balance: sql<number>`sum(${accounts.balance})` }).from(accounts).where(eq(accounts.userId, userId))
    : db.select({ balance: accounts.balance }).from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
  
  const accountRes = await accountQuery;
  const currentCashBalance = Number(accountRes[0]?.balance || 0);

  // 2. Fetch Cash Flow Trend (Last 6 Months)
  const cashFlow = await db.select({
    month: sql<string>`DATE_FORMAT(${transactions.effectDate}, '%b')`,
    income: sql<number>`SUM(CASE WHEN ${transactions.type} = 'CR' THEN ${transactions.amount} ELSE 0 END)`,
    expense: sql<number>`SUM(CASE WHEN ${transactions.type} = 'DB' THEN ${transactions.amount} ELSE 0 END)`,
  })
  .from(transactions)
  .where(eq(transactions.userId, userId))
  .groupBy(sql`DATE_FORMAT(${transactions.effectDate}, '%b')`)
  .orderBy(desc(sql`MIN(${transactions.effectDate})`))
  .limit(6);

  // 3. Fetch Budget stringified breakdown and initial amount
  const budgetQuery = db.select({
    initAmount: expenseBudgets.initAllocatedAmount,
    breakdown: expenseBudgets.breakdown,
  })
  .from(expenseBudgets)
  .where(
    accountId === 'all' 
      ? eq(expenseBudgets.userId, userId) 
      : and(eq(expenseBudgets.userId, userId), eq(expenseBudgets.accountId, accountId))
  )
  .limit(1);

  // 3. Category Breakdowns (Major vs Subcategory)
  const categoryData = await db.select({
    name: transactions.category,
    value: sql<number>`SUM(${transactions.amount})`,
  })
  .from(transactions)
  .where(and(eq(transactions.userId, userId), eq(transactions.type, 'DB')))
  .groupBy(transactions.category);

  const subCategoryData = await db.select({
    name: transactionBreakdown.category,
    value: sql<number>`SUM(${transactionBreakdown.totalPrice})`,
    parent: transactions.category
  })
  .from(transactionBreakdown)
  .innerJoin(transactions, eq(transactionBreakdown.transactionId, transactions.id))
  .where(eq(transactionBreakdown.userId, userId))
  .groupBy(transactionBreakdown.category, transactions.category);

  const budgetRes = await budgetQuery;
  const budgetRow = budgetRes[0];

  let totalBudgeted = Number(budgetRow?.initAmount || 0);
  let parsedBreakdown: Array<{ id: string, category: string, limit: number }> = [];

  if (budgetRow?.breakdown) {
    try {
      parsedBreakdown = JSON.parse(budgetRow.breakdown);
    } catch (e) {
      console.error("Failed to parse budget breakdown JSON", e);
    }
  }

  // 4. Fetch Actuals from Transactions
  const actuals = await db.select({
    category: transactionBreakdown.category,
    categoryName: expenseCategories.name,     // Join to get the actual name
    spent: sql<number>`SUM(${transactionBreakdown.totalPrice})`,
  })
  .from(transactions)
  .innerJoin(transactionBreakdown, eq(transactions.id, transactionBreakdown.transactionId))
  .leftJoin(expenseCategories, eq(transactionBreakdown.category, expenseCategories.id)) // Ensure this matches your schema relations
  .where(and(
    eq(transactions.userId, userId), 
    eq(transactions.type, 'DB'),
    accountId !== 'all' ? eq(transactions.accountId, accountId) : sql`1=1`
  ))
  .groupBy(transactionBreakdown.category);

  // const query = db.select({
  //   category: transactionBreakdown.category,
  //   categoryName: expenseCategories.name,     // Join to get the actual name
  //   spent: sql<number>`SUM(${transactionBreakdown.totalPrice})`,
  // })
  // .from(transactions)
  // .innerJoin(transactionBreakdown, eq(transactions.id, transactionBreakdown.transactionId))
  // .leftJoin(expenseCategories, eq(transactionBreakdown.category, expenseCategories.id)) // Ensure this matches your schema relations
  // .where(and(
  //   eq(transactions.userId, userId), 
  //   eq(transactions.type, 'DB'),
  //   accountId !== 'all' ? eq(transactions.accountId, accountId) : sql`1=1`
  // ))
  // .groupBy(transactionBreakdown.category).toSQL();
  // console.log('Qyery: ', query);

  // 5. Calculate Variances mapping parsed breakdown to actuals
  let totalActual = 0;

  const budgetItems = parsedBreakdown.map(b => {
    // Match based on the ID stored in the breakdown array
    const actualRecord = actuals.find(a => a.category === b.category);
    const actualSpent = actualRecord?.spent || 0;
    const actualNum = Number(actualSpent);
    const limitNum = Number(b.limit);
    const utilization = limitNum > 0 ? (actualNum / limitNum) * 100 : 0;
    
    totalActual += actualNum;

    return {
      // Use the joined name from actuals, fallback to the string in the breakdown, or a default
      category: actualRecord?.category || b.category || 'Unknown Category',
      limit: limitNum,
      actual: actualNum,
      utilization: Math.round(utilization),
      status: utilization >= 100 ? 'Over Budget' : utilization >= 80 ? 'Warning' : 'On Track'
    };
  });

  const overallUtilization = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;

  return {
    currentCashBalance,
    cashFlow: cashFlow.map(c => ({ 
      month: c.month, 
      income: Number(c.income), 
      expense: Number(c.expense) 
    })),
    majorCategories: categoryData.map((c, i) => ({ name: c.name, value: Number(c.value), color: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][i % 5] })),
    subCategories: subCategoryData.map((c, i) => ({ name: c.name, value: Number(c.value), parent: c.parent, color: ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'][i % 5] })),
    budgetIntelligence: {
      items: budgetItems,
      totalBudgeted,
      totalActual,
      overallUtilization
    },
    actuals
  };
}

export async function getCategoryMap(userId: string, accountId: string | null = null, type: 'expense' | 'income' | 'all' = 'expense'): Promise<IAPIResponse> {
  let response: IAPIResponse = {
    status: 0,
    data: undefined,
    message: '',
    error: null
  }

  try {
    if(type == 'expense') {
      const categories = accountId 
        ? await db
          .select({
            id: expenseCategories.id,
            name: expenseCategories.name,
          })
          .from(expenseCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, expenseCategories.purpose))
          .where(and(eq(expenseCategories.userId, userId), eq(accounts.id, accountId)))
        : await db
          .select({
            id: expenseCategories.id,
            name: expenseCategories.name,
          })
          .from(expenseCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, expenseCategories.purpose))
          .where(eq(expenseCategories.userId, userId));
        
      // Convert array of categories into a dictionary/map: { "cat_123": "Groceries", "cat_456": "Utilities" }
      const categoryMap: Record<string, string> = {};
      for (const cat of categories) {
        categoryMap[cat.id] = cat.name;
      }
  
      response.status = HttpStatus.OK;
      response.data = categoryMap;

    } else if(type == 'income') {
      const categories = accountId 
        ? await db
          .select({
            id: incomeCategories.id,
            name: incomeCategories.name,
          })
          .from(incomeCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, incomeCategories.purpose))
          .where(and(eq(incomeCategories.userId, userId), eq(accounts.id, accountId)))
        : await db
          .select({
            id: incomeCategories.id,
            name: incomeCategories.name,
          })
          .from(incomeCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, incomeCategories.purpose))
          .where(eq(incomeCategories.userId, userId));
        
      // Convert array of categories into a dictionary/map: { "cat_123": "Groceries", "cat_456": "Utilities" }
      const categoryMap: Record<string, string> = {};
      for (const cat of categories) {
        categoryMap[cat.id] = cat.name;
      }
  
      response.status = HttpStatus.OK;
      response.data = categoryMap;

    } else if(type == 'all') {
      const eCategories = accountId 
        ? db
          .select({
            id: expenseCategories.id,
            name: expenseCategories.name,
          })
          .from(expenseCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, expenseCategories.purpose))
          .where(and(eq(expenseCategories.userId, userId), eq(accounts.id, accountId)))
        : db
          .select({
            id: expenseCategories.id,
            name: expenseCategories.name,
          })
          .from(expenseCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, expenseCategories.purpose))
          .where(eq(expenseCategories.userId, userId));

      const iCategories = accountId 
        ? db
          .select({
            id: incomeCategories.id,
            name: incomeCategories.name,
          })
          .from(incomeCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, incomeCategories.purpose))
          .where(and(eq(incomeCategories.userId, userId), eq(accounts.id, accountId)))
        : db
          .select({
            id: incomeCategories.id,
            name: incomeCategories.name,
          })
          .from(incomeCategories)
          .innerJoin(accounts, eq(accounts.expenseCateg, incomeCategories.purpose))
          .where(eq(incomeCategories.userId, userId));

      const allCategoryMap = await unionAll(eCategories, iCategories);

      console.log('allCategoriesMap: ', allCategoryMap);
        
      // Convert array of categories into a dictionary/map: { "cat_123": "Groceries", "cat_456": "Utilities" }
      const categoryMap: Record<string, string> = {};
      for (const cat of allCategoryMap) {
        categoryMap[cat.id] = cat.name;
      }
  
      response.status = HttpStatus.OK;
      response.data = categoryMap;
      
    }
    
  } catch (error) {
    console.error('Failed to fetch category map:', error);
    response.status = HttpStatus.Internal;
    response.error = (error as Error).message;
  }

  return response;
}