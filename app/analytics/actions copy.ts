'use server';

import { db } from '@/src/drizzle'; // Adjust to your actual Drizzle DB instance import
import { 
  transactions, 
  transactionBreakdown, 
  recurringExpenses, 
  accounts,
  AIUsageTracker, 
  expenseBudgets
} from '@/src/drizzle/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google'; // Or your preferred AI provider

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
  // ... existing queries for account balance and cash flow ...
  
  // 1. Fetch current cycle budget limits
  const currentCycle = '2026-09'; // In production, calculate dynamically based on dateRange
  const budgets = await db.select()
    .from(expenseBudgets)
    .where(
        and(
            eq(expenseBudgets.userId, userId)
            , eq(expenseBudgets.accountId, accountId)
        )
        // , eq(expenseBudgets.cycle, currentCycle))
    );

  // 2. Fetch actual spend per category for the current cycle
  const actualSpend = await db.select({
    category: transactions.category,
    spent: sql<number>`SUM(${transactions.amount})`,
  })
  .from(transactions)
  .where(
    and(
      eq(transactions.userId, userId), 
      eq(transactions.type, 'DB'),
      gte(transactions.effectDate, new Date(`${currentCycle}-01`))
    )
  )
  .groupBy(transactions.category);

  // 3. Map actuals against the budget
  const budgetItems = JSON.parse(budgets[0].breakdown!) as IBudgetItem[];

  const budgetVsActual = budgetItems.map(b => {
    const actual = actualSpend.find(a => a.category === b.category)?.spent || 0;
    const limit = Number(b.limit);
    return {
      category: b.category,
      limit,
      actual: Number(actual),
      utilization: limit > 0 ? (Number(actual) / limit) * 100 : 0,
      status: Number(actual) > limit ? 'Over Budget' : 'On Track'
    };
  });

  // Calculate total budget health
  const totalBudgeted = budgetVsActual.reduce((sum, item) => sum + item.limit, 0);
  const totalActual = budgetVsActual.reduce((sum, item) => sum + item.actual, 0);

  return {
    // ... return existing metrics (cashFlow, majorCategories, etc.) ...
    budgetIntelligence: {
      items: budgetVsActual,
      totalBudgeted,
      totalActual,
      overallUtilization: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0
    }
  };
}