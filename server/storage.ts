import { categories, transactions, budgets, type Category, type Transaction, type Budget, type InsertCategory, type InsertTransaction, type InsertBudget, type TransactionWithCategory, type BudgetWithCategory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Transactions
  getTransactions(): Promise<TransactionWithCategory[]>;
  getTransactionById(id: number): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Budgets
  getBudgets(): Promise<BudgetWithCategory[]>;
  getBudgetById(id: number): Promise<BudgetWithCategory | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Analytics
  getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]>;
  getCategoryExpenses(): Promise<{ category: string; amount: number; color: string }[]>;
  getSummaryStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    try {
      const existingCategories = await db.select().from(categories);
      
      if (existingCategories.length === 0) {
        const defaultCategories: InsertCategory[] = [
          { name: "Food & Dining", color: "#f97316", icon: "fas fa-utensils" },
          { name: "Transportation", color: "#eab308", icon: "fas fa-car" },
          { name: "Housing", color: "#8b5cf6", icon: "fas fa-home" },
          { name: "Entertainment", color: "#3b82f6", icon: "fas fa-gamepad" },
          { name: "Shopping", color: "#ef4444", icon: "fas fa-shopping-bag" },
          { name: "Income", color: "#059669", icon: "fas fa-money-bill" },
          { name: "Healthcare", color: "#06b6d4", icon: "fas fa-heartbeat" },
          { name: "Other", color: "#64748b", icon: "fas fa-ellipsis-h" },
        ];

        await db.insert(categories).values(defaultCategories);
      }
    } catch (error) {
      console.error("Error initializing default categories:", error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Transactions
  async getTransactions(): Promise<TransactionWithCategory[]> {
    return await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        categoryId: transactions.categoryId,
        date: transactions.date,
        type: transactions.type,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.date));
  }

  async getTransactionById(id: number): Promise<TransactionWithCategory | undefined> {
    const [transaction] = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        categoryId: transactions.categoryId,
        date: transactions.date,
        type: transactions.type,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.id, id));
    
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // Convert string date to Date object and amount to string for decimal
    const transactionData = {
      ...insertTransaction,
      date: new Date(insertTransaction.date),
      amount: insertTransaction.amount.toString(),
    };
    
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateData: any = { ...updates };
    
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.amount) {
      updateData.amount = updateData.amount.toString();
    }
    
    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    
    return transaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  // Budgets
  async getBudgets(): Promise<BudgetWithCategory[]> {
    return await db
      .select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        amount: budgets.amount,
        month: budgets.month,
        year: budgets.year,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id));
  }

  async getBudgetById(id: number): Promise<BudgetWithCategory | undefined> {
    const [budget] = await db
      .select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        amount: budgets.amount,
        month: budgets.month,
        year: budgets.year,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.id, id));
    
    return budget || undefined;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const budgetData = {
      ...insertBudget,
      amount: insertBudget.amount.toString(),
    };
    
    const [budget] = await db.insert(budgets).values(budgetData).returning();
    return budget;
  }

  async updateBudget(id: number, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const updateData: any = { ...updates };
    
    if (updateData.amount) {
      updateData.amount = updateData.amount.toString();
    }
    
    const [budget] = await db
      .update(budgets)
      .set(updateData)
      .where(eq(budgets.id, id))
      .returning();
    
    return budget || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return result.rowCount > 0;
  }

  // Analytics
  async getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const expenses = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
        })
        .from(transactions)
        .where(
          sql`${transactions.type} = 'expense' AND ${transactions.date} >= ${date} AND ${transactions.date} < ${nextDate}`
        );
      
      result.push({
        month: monthNames[date.getMonth()],
        amount: parseFloat(expenses[0]?.total || "0"),
      });
    }
    
    return result;
  }

  async getCategoryExpenses(): Promise<{ category: string; amount: number; color: string }[]> {
    const categoryExpenses = await db
      .select({
        categoryName: categories.name,
        categoryColor: categories.color,
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.type, "expense"))
      .groupBy(categories.id, categories.name, categories.color);
    
    return categoryExpenses
      .filter(expense => parseFloat(expense.total) > 0)
      .map(expense => ({
        category: expense.categoryName || "Unknown",
        amount: parseFloat(expense.total),
        color: expense.categoryColor || "#64748b",
      }));
  }

  async getSummaryStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    // Get total balance (all income - all expenses)
    const totalIncomeResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.type, "income"));
    
    const totalExpensesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.type, "expense"));
    
    // Get monthly income
    const monthlyIncomeResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(
        sql`${transactions.type} = 'income' AND ${transactions.date} >= ${firstDayOfMonth} AND ${transactions.date} < ${firstDayOfNextMonth}`
      );
    
    // Get monthly expenses
    const monthlyExpensesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(
        sql`${transactions.type} = 'expense' AND ${transactions.date} >= ${firstDayOfMonth} AND ${transactions.date} < ${firstDayOfNextMonth}`
      );
    
    const totalIncome = parseFloat(totalIncomeResult[0]?.total || "0");
    const totalExpenses = parseFloat(totalExpensesResult[0]?.total || "0");
    const monthlyIncome = parseFloat(monthlyIncomeResult[0]?.total || "0");
    const monthlyExpenses = parseFloat(monthlyExpensesResult[0]?.total || "0");
    
    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
    };
  }
}

export const storage = new DatabaseStorage();