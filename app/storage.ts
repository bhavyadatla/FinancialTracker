import { categories, transactions, budgets, type Category, type Transaction, type Budget, type InsertCategory, type InsertTransaction, type InsertBudget, type TransactionWithCategory, type BudgetWithCategory } from "../shared/schema";

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

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private currentCategoryId: number;
  private currentTransactionId: number;
  private currentBudgetId: number;

  constructor() {
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    this.currentBudgetId = 1;

    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
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

    defaultCategories.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Transactions
  async getTransactions(): Promise<TransactionWithCategory[]> {
    const transactions = Array.from(this.transactions.values());
    return transactions.map(transaction => {
      const category = this.categories.get(transaction.categoryId);
      return {
        ...transaction,
        category: category!,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionById(id: number): Promise<TransactionWithCategory | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const category = this.categories.get(transaction.categoryId);
    return {
      ...transaction,
      category: category!,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      date: new Date(insertTransaction.date),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : transaction.amount,
      date: updates.date ? new Date(updates.date) : transaction.date,
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Budgets
  async getBudgets(): Promise<BudgetWithCategory[]> {
    const budgets = Array.from(this.budgets.values());
    return budgets.map(budget => {
      const category = this.categories.get(budget.categoryId);
      return {
        ...budget,
        category: category!,
      };
    });
  }

  async getBudgetById(id: number): Promise<BudgetWithCategory | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const category = this.categories.get(budget.categoryId);
    return {
      ...budget,
      category: category!,
    };
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const budget: Budget = {
      ...insertBudget,
      id,
      amount: insertBudget.amount.toString(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const updatedBudget: Budget = {
      ...budget,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : budget.amount,
    };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Analytics
  async getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.type === 'expense');

    const monthlyData: { [key: string]: number } = {};
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = 0;
    }

    transactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toISOString().slice(0, 7);
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += parseFloat(transaction.amount);
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      amount,
    }));
  }

  async getCategoryExpenses(): Promise<{ category: string; amount: number; color: string }[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.type === 'expense');

    const categoryData: { [key: number]: number } = {};

    transactions.forEach(transaction => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const transactionDate = new Date(transaction.date);
      
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        categoryData[transaction.categoryId] = (categoryData[transaction.categoryId] || 0) + parseFloat(transaction.amount);
      }
    });

    return Object.entries(categoryData).map(([categoryId, amount]) => {
      const category = this.categories.get(parseInt(categoryId));
      return {
        category: category?.name || 'Unknown',
        amount,
        color: category?.color || '#64748b',
      };
    });
  }

  async getSummaryStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    const transactions = Array.from(this.transactions.values());
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalIncome = 0;
    let totalExpenses = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const transactionDate = new Date(transaction.date);
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;

      if (transaction.type === 'income') {
        totalIncome += amount;
        if (isCurrentMonth) monthlyIncome += amount;
      } else {
        totalExpenses += amount;
        if (isCurrentMonth) monthlyExpenses += amount;
      }
    });

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

export const storage = new MemStorage();
