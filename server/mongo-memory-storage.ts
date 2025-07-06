import { 
  Category as CategoryType, 
  Transaction as TransactionType, 
  Budget as BudgetType,
  InsertCategory, 
  InsertTransaction, 
  InsertBudget, 
  TransactionWithCategory, 
  BudgetWithCategory 
} from '../shared/mongodb-types';

export interface IStorage {
  // Categories
  getCategories(): Promise<CategoryType[]>;
  getCategoryById(id: string): Promise<CategoryType | undefined>;
  createCategory(category: InsertCategory): Promise<CategoryType>;

  // Transactions
  getTransactions(): Promise<TransactionWithCategory[]>;
  getTransactionById(id: string): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<TransactionType>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<TransactionType | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Budgets
  getBudgets(): Promise<BudgetWithCategory[]>;
  getBudgetById(id: string): Promise<BudgetWithCategory | undefined>;
  createBudget(budget: InsertBudget): Promise<BudgetType>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<BudgetType | undefined>;
  deleteBudget(id: string): Promise<boolean>;

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

export class MongoMemoryStorage implements IStorage {
  private categories: Map<string, CategoryType>;
  private transactions: Map<string, TransactionType>;
  private budgets: Map<string, BudgetType>;
  private currentId: number;

  constructor() {
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.currentId = 1;
    this.initializeDefaultCategories();
    this.initializeSampleData();
  }

  private generateId(): string {
    return (this.currentId++).toString().padStart(24, '0');
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Food & Dining", color: "#f97316", icon: "fas fa-utensils" },
      { name: "Transportation", color: "#eab308", icon: "fas fa-car" },
      { name: "Housing", color: "#8b5cf6", icon: "fas fa-home" },
      { name: "Entertainment", color: "#3b82f6", icon: "fas fa-gamepad" },
      { name: "Shopping", color: "#ef4444", icon: "fas fa-shopping-bag" },
      { name: "Income", color: "#059669", icon: "fas fa-money-bill" },
      { name: "Healthcare", color: "#06b6d4", icon: "fas fa-heartbeat" },
      { name: "Other", color: "#64748b", icon: "fas fa-ellipsis-h" },
    ];

    defaultCategories.forEach(cat => {
      const id = this.generateId();
      const category: CategoryType = { ...cat, _id: id };
      this.categories.set(id, category);
    });
  }

  private initializeSampleData() {
    // Get category IDs for sample transactions
    const categories = Array.from(this.categories.values());
    const foodCategory = categories.find(c => c.name === "Food & Dining");
    const transportCategory = categories.find(c => c.name === "Transportation");
    const incomeCategory = categories.find(c => c.name === "Income");
    const housingCategory = categories.find(c => c.name === "Housing");
    const entertainmentCategory = categories.find(c => c.name === "Entertainment");

    if (!foodCategory || !transportCategory || !incomeCategory || !housingCategory || !entertainmentCategory) return;

    // Sample transactions for the current month and previous months
    const sampleTransactions = [
      // Current month income
      {
        description: "Salary",
        amount: 4500,
        categoryId: incomeCategory._id,
        date: new Date(2025, 6, 1), // July 1, 2025
        type: "income" as const,
      },
      {
        description: "Freelance Project",
        amount: 800,
        categoryId: incomeCategory._id,
        date: new Date(2025, 6, 15), // July 15, 2025
        type: "income" as const,
      },
      
      // Current month expenses
      {
        description: "Rent",
        amount: 1200,
        categoryId: housingCategory._id,
        date: new Date(2025, 6, 1), // July 1, 2025
        type: "expense" as const,
      },
      {
        description: "Grocery Shopping",
        amount: 85.50,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 3), // July 3, 2025
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 45.20,
        categoryId: transportCategory._id,
        date: new Date(2025, 6, 4), // July 4, 2025
        type: "expense" as const,
      },
      {
        description: "Restaurant Dinner",
        amount: 67.80,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 5), // July 5, 2025
        type: "expense" as const,
      },
      {
        description: "Movie Theater",
        amount: 24.50,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 6, 6), // July 6, 2025
        type: "expense" as const,
      },

      // Previous month (June) expenses for trend data
      {
        description: "June Rent",
        amount: 1200,
        categoryId: housingCategory._id,
        date: new Date(2025, 5, 1), // June 1, 2025
        type: "expense" as const,
      },
      {
        description: "June Groceries",
        amount: 320.75,
        categoryId: foodCategory._id,
        date: new Date(2025, 5, 15), // June 15, 2025
        type: "expense" as const,
      },
      {
        description: "Gas & Transport",
        amount: 180.40,
        categoryId: transportCategory._id,
        date: new Date(2025, 5, 20), // June 20, 2025
        type: "expense" as const,
      },

      // May expenses for trend data
      {
        description: "May Rent",
        amount: 1200,
        categoryId: housingCategory._id,
        date: new Date(2025, 4, 1), // May 1, 2025
        type: "expense" as const,
      },
      {
        description: "May Food & Dining",
        amount: 275.60,
        categoryId: foodCategory._id,
        date: new Date(2025, 4, 10), // May 10, 2025
        type: "expense" as const,
      },
    ];

    // Create sample transactions
    sampleTransactions.forEach(transaction => {
      const id = this.generateId();
      const transactionRecord: TransactionType = {
        ...transaction,
        _id: id,
      };
      this.transactions.set(id, transactionRecord);
    });

    // Create sample budgets
    const sampleBudgets = [
      {
        categoryId: foodCategory._id,
        amount: 400,
        month: 7, // July
        year: 2025,
      },
      {
        categoryId: transportCategory._id,
        amount: 200,
        month: 7, // July
        year: 2025,
      },
      {
        categoryId: entertainmentCategory._id,
        amount: 150,
        month: 7, // July
        year: 2025,
      },
    ];

    sampleBudgets.forEach(budget => {
      const id = this.generateId();
      const budgetRecord: BudgetType = {
        ...budget,
        _id: id,
      };
      this.budgets.set(id, budgetRecord);
    });
  }

  // Categories
  async getCategories(): Promise<CategoryType[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<CategoryType | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    const id = this.generateId();
    const category: CategoryType = { ...insertCategory, _id: id };
    this.categories.set(id, category);
    return category;
  }

  // Transactions
  async getTransactions(): Promise<TransactionWithCategory[]> {
    const transactions = Array.from(this.transactions.values());
    const transactionsWithCategory: TransactionWithCategory[] = [];

    for (const transaction of transactions) {
      const category = this.categories.get(transaction.categoryId);
      if (category) {
        transactionsWithCategory.push({
          ...transaction,
          category,
        });
      }
    }

    return transactionsWithCategory.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransactionById(id: string): Promise<TransactionWithCategory | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const category = this.categories.get(transaction.categoryId);
    if (!category) return undefined;

    return {
      ...transaction,
      category,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionType> {
    const id = this.generateId();
    const transaction: TransactionType = {
      ...insertTransaction,
      _id: id,
      date: new Date(insertTransaction.date),
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<TransactionType | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: TransactionType = {
      ...transaction,
      ...updates,
      date: updates.date ? new Date(updates.date) : transaction.date,
    };

    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Budgets
  async getBudgets(): Promise<BudgetWithCategory[]> {
    const budgets = Array.from(this.budgets.values());
    const budgetsWithCategory: BudgetWithCategory[] = [];

    for (const budget of budgets) {
      const category = this.categories.get(budget.categoryId);
      if (category) {
        budgetsWithCategory.push({
          ...budget,
          category,
        });
      }
    }

    return budgetsWithCategory;
  }

  async getBudgetById(id: string): Promise<BudgetWithCategory | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const category = this.categories.get(budget.categoryId);
    if (!category) return undefined;

    return {
      ...budget,
      category,
    };
  }

  async createBudget(insertBudget: InsertBudget): Promise<BudgetType> {
    const id = this.generateId();
    const budget: BudgetType = {
      ...insertBudget,
      _id: id,
    };
    
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<BudgetType | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const updatedBudget: BudgetType = {
      ...budget,
      ...updates,
    };

    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Analytics
  async getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const transactions = Array.from(this.transactions.values()).filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= targetDate && 
        new Date(t.date) < nextMonth
      );

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);

      result.push({
        month: monthNames[targetDate.getMonth()],
        amount: total,
      });
    }

    return result;
  }

  async getCategoryExpenses(): Promise<{ category: string; amount: number; color: string }[]> {
    const expensesByCategory = new Map<string, number>();

    // Group expenses by category
    Array.from(this.transactions.values())
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const current = expensesByCategory.get(transaction.categoryId) || 0;
        expensesByCategory.set(transaction.categoryId, current + transaction.amount);
      });

    // Map to category details and filter out zero amounts
    const result: { category: string; amount: number; color: string }[] = [];
    
    expensesByCategory.forEach((amount, categoryId) => {
      if (amount > 0) {
        const category = this.categories.get(categoryId);
        if (category) {
          result.push({
            category: category.name,
            amount,
            color: category.color,
          });
        }
      }
    });

    return result;
  }

  async getSummaryStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const allTransactions = Array.from(this.transactions.values());
    
    // Calculate totals
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly totals
    const monthlyTransactions = allTransactions.filter(t => 
      new Date(t.date) >= firstDayOfMonth
    );
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

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

export const storage = new MongoMemoryStorage();