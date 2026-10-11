// db/schema.ts
import { mysqlTable, serial, varchar, text, json, timestamp, mediumtext, decimal, int, tinyint } from 'drizzle-orm/mysql-core';
import { v4 as uuidv4 } from 'uuid';

export const expenseCategories = mysqlTable('expense_categories', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'personal', 'small_business', etc.
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  level: varchar({ length: 255 }).default('').notNull(),
  parent: varchar({ length: 255 }).default('').notNull(),
  
  // Storing the string array dynamically using MySQL JSON capabilities
  examples: mediumtext(),

  userId: varchar({ length: 255 }).default(''),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Typings export helper for inference bindings across your Server Actions
export type DBExpenseCategory = typeof expenseCategories.$inferSelect;
export type NewDBExpenseCategory = typeof expenseCategories.$inferInsert;

export const accounts = mysqlTable('accounts', {
  // UUID key mapping using crypto.randomUUID()
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => uuidv4()),
    
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // e.g. "Main Checking", "Amex Card"
  type: varchar('type', { length: 50 }).notNull(), // 'checking' | 'savings' | 'cash' | 'credit'
  
  // High precision decimal column for financial balances
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  description: text('description'),

  expenseCateg: varchar({ length: 50 }).default('personal').notNull(),
  incomeCateg: varchar({ length: 50 }).default('personal').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type DBAccount = typeof accounts.$inferSelect;
export type NewDBAccount = typeof accounts.$inferInsert;

export const incomeCategories = mysqlTable('income_categories', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'personal', 'small_business', etc.
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  level: varchar({ length: 255 }).default('').notNull(),
  parent: varchar({ length: 255 }).default('').notNull(),

  
  // Storing the string array dynamically using MySQL JSON capabilities
  examples: mediumtext(),

  userId: varchar({ length: 255 }).default(''),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Typings export helper for inference bindings across your Server Actions
export type DBIncomeCategory = typeof incomeCategories.$inferSelect;
export type NewDBIncomeCategory = typeof incomeCategories.$inferInsert;

export const recurringExpenses = mysqlTable('recurring_expenses', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  accountId: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  service: varchar({ length: 255 }).notNull(),
  frequency: varchar({ length: 20 }).notNull(),
  cycleDays: int().default(30),
  amount: decimal('amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  nextDate: varchar({ length: 20 }),
  comment: varchar({ length: 255 }),
  expenseCateg: varchar({ length: 255 }).notNull(),
});

// Typings export helper for inference bindings across your Server Actions
export type DBRecurrExpenses = typeof recurringExpenses.$inferSelect;
export type NewDBRecurrExpenses = typeof recurringExpenses.$inferInsert;

export const expenseBudgets = mysqlTable('expense_budgets', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  accountId: varchar({ length: 255 }).notNull(),
  expenseCateg: varchar({ length: 255 }).notNull(),
  initAllocatedAmount: decimal('initAmount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  breakdown: mediumtext(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type DBExpenseBudgets = typeof expenseBudgets.$inferSelect;
export type NewDBExpenseBudgets = typeof expenseBudgets.$inferInsert;

export const transactions = mysqlTable('transactions', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  accountId: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  details: varchar({ length: 255 }).default('').notNull(), 
  createDate: timestamp('createDate').defaultNow().notNull(),
  effectDate: timestamp('effectDate').defaultNow().notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  type: varchar({ length: 2 }).default('DB').notNull(),
  category: varchar({ length: 255 }).default('').notNull(),
  notes: varchar({ length: 255 }).default(''),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull()
});

export type DBTransactions = typeof transactions.$inferSelect;
export type NewDBTransactions = typeof transactions.$inferInsert;

export const transactionBreakdown = mysqlTable('transaction_breakdown', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  transactionId: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  details: varchar({ length: 255 }).default('').notNull(), 
  unitPrice: decimal('unitPrice', { precision: 12, scale: 2 }).default('0.00').notNull(),
  quatity: int().default(0).notNull(),
  totalPrice: decimal('totalPrice', { precision: 12, scale: 2 }).default('0.00').notNull(),
  category: varchar({ length: 255 }).default('').notNull(),
});

export type DBTransactionBreakdown = typeof transactionBreakdown.$inferSelect;
export type NewDBTransactionBreakdown = typeof transactionBreakdown.$inferInsert;

export const budgetMakerSettings = mysqlTable('budget_maker_settings', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  userId: varchar({ length: 255 }).notNull(),
  displayCartaAiAvatar: tinyint().default(1).notNull(),
  cartaAiAvatarGender: varchar({ length: 10 }).default('female').notNull(),
  cartaAiAvatarNameFemale: varchar({ length: 10}).default('Sandra').notNull(),
  cartaAiAvatarNameMale: varchar({ length: 10}).default('Alex').notNull(),
  cartaAiAvatarStyle: tinyint().default(2).notNull(),
  lastUpdated: timestamp('effectDate').defaultNow().notNull(),
});

export type DBBudgetMakerSettings = typeof budgetMakerSettings.$inferSelect;
export type NewDBBudgetMakerSettings = typeof budgetMakerSettings.$inferInsert;

export const AIUsageTracker = mysqlTable('ai_usage_tracker', {
  id: varchar({ length: 255 }).$defaultFn(() => uuidv4()).primaryKey(),
  userId: varchar({ length: 255 }).notNull(),
  prompt: mediumtext(),
  inputTokens: int('input_tokens', { unsigned: true }).default(0).notNull(),
  outputTokens: int('output_tokens', { unsigned: true }).default(0).notNull(),
  totalTokens: int('total_tokens', { unsigned: true }).default(0).notNull(),
  timeStamp: timestamp('time_stamp').defaultNow().notNull(),
});

export type DBAIUsageTracker = typeof AIUsageTracker.$inferSelect;
export type NewDBAIUsageTracker = typeof AIUsageTracker.$inferInsert;
