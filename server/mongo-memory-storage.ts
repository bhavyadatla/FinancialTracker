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
  getCategoriesByType(type: 'income' | 'expense'): Promise<CategoryType[]>;
  getCategoryById(id: string): Promise<CategoryType | undefined>;
  createCategory(category: InsertCategory): Promise<CategoryType>;

  // Transactions
  getTransactions(): Promise<TransactionWithCategory[]>;
  getTransactionById(id: string): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<TransactionType>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<TransactionType | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Advanced Transaction Features
  getTransactionsFiltered(filters: {
    categoryId?: string;
    type?: 'income' | 'expense';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionWithCategory[]>;
  getTransactionsForExport(startDate?: Date, endDate?: Date): Promise<TransactionWithCategory[]>;
  exportToCSV(data: TransactionWithCategory[]): Promise<string>;

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

  // Advanced Analytics
  getSpendingTrends(months: number): Promise<{ month: string; income: number; expenses: number; savings: number }[]>;
  getSpendingForecast(months: number): Promise<{ month: string; predicted: number; confidence: number }[]>;
  getBudgetPerformance(): Promise<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    percentageUsed: number;
  }[]>;
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
      // Expense Categories
      { name: "Food & Dining", color: "#f97316", icon: "fas fa-utensils", type: "expense" as const },
      { name: "Transportation", color: "#eab308", icon: "fas fa-car", type: "expense" as const },
      { name: "Housing", color: "#8b5cf6", icon: "fas fa-home", type: "expense" as const },
      { name: "Entertainment", color: "#3b82f6", icon: "fas fa-gamepad", type: "expense" as const },
      { name: "Shopping", color: "#ef4444", icon: "fas fa-shopping-bag", type: "expense" as const },
      { name: "Healthcare", color: "#06b6d4", icon: "fas fa-heartbeat", type: "expense" as const },
      { name: "Other Expense", color: "#64748b", icon: "fas fa-ellipsis-h", type: "expense" as const },
      
      // Income Categories
      { name: "Salary", color: "#059669", icon: "fas fa-money-bill", type: "income" as const },
      { name: "Business", color: "#10b981", icon: "fas fa-briefcase", type: "income" as const },
      { name: "Investment", color: "#34d399", icon: "fas fa-chart-line", type: "income" as const },
      { name: "Gift", color: "#6ee7b7", icon: "fas fa-gift", type: "income" as const },
      { name: "Other Income", color: "#a7f3d0", icon: "fas fa-plus-circle", type: "income" as const },
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
    const salaryCategory = categories.find(c => c.name === "Salary");
    const businessCategory = categories.find(c => c.name === "Business");
    const investmentCategory = categories.find(c => c.name === "Investment");
    const housingCategory = categories.find(c => c.name === "Housing");
    const entertainmentCategory = categories.find(c => c.name === "Entertainment");
    const shoppingCategory = categories.find(c => c.name === "Shopping");
    const healthcareCategory = categories.find(c => c.name === "Healthcare");
    const giftCategory = categories.find(c => c.name === "Gift");

    if (!foodCategory || !transportCategory || !salaryCategory || !housingCategory || !entertainmentCategory || !shoppingCategory || !healthcareCategory) return;

    // Comprehensive sample transactions across 6 months
    const sampleTransactions = [
      // JULY 2025 (Current month)
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 6, 1),
        type: "income" as const,
      },
      {
        description: "Freelance Web Design",
        amount: 1200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 6, 15),
        type: "income" as const,
      },
      {
        description: "Investment Dividend",
        amount: 285,
        categoryId: salaryCategory._id,
        date: new Date(2025, 6, 20),
        type: "income" as const,
      },

      // July Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 6, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 145,
        categoryId: housingCategory._id,
        date: new Date(2025, 6, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 6, 5),
        type: "expense" as const,
      },
      {
        description: "Whole Foods Groceries",
        amount: 125.50,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 2),
        type: "expense" as const,
      },
      {
        description: "Trader Joe's",
        amount: 85.20,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 6),
        type: "expense" as const,
      },
      {
        description: "Coffee Shop",
        amount: 15.75,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 4),
        type: "expense" as const,
      },
      {
        description: "Sushi Restaurant",
        amount: 89.50,
        categoryId: foodCategory._id,
        date: new Date(2025, 6, 7),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 52.30,
        categoryId: transportCategory._id,
        date: new Date(2025, 6, 3),
        type: "expense" as const,
      },
      {
        description: "Uber Rides",
        amount: 28.50,
        categoryId: transportCategory._id,
        date: new Date(2025, 6, 6),
        type: "expense" as const,
      },
      {
        description: "Amazon Prime",
        amount: 14.99,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 6, 1),
        type: "expense" as const,
      },
      {
        description: "Clothing Store",
        amount: 156.80,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 6, 8),
        type: "expense" as const,
      },
      {
        description: "Netflix Subscription",
        amount: 15.99,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 6, 2),
        type: "expense" as const,
      },
      {
        description: "Concert Tickets",
        amount: 120.00,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 6, 10),
        type: "expense" as const,
      },
      {
        description: "Pharmacy",
        amount: 45.25,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 6, 5),
        type: "expense" as const,
      },

      // JUNE 2025
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 5, 1),
        type: "income" as const,
      },
      {
        description: "Side Project",
        amount: 800,
        categoryId: salaryCategory._id,
        date: new Date(2025, 5, 20),
        type: "income" as const,
      },

      // June Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 5, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 132,
        categoryId: housingCategory._id,
        date: new Date(2025, 5, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 5, 5),
        type: "expense" as const,
      },
      {
        description: "Costco Groceries",
        amount: 245.80,
        categoryId: foodCategory._id,
        date: new Date(2025, 5, 4),
        type: "expense" as const,
      },
      {
        description: "Local Restaurant",
        amount: 65.40,
        categoryId: foodCategory._id,
        date: new Date(2025, 5, 12),
        type: "expense" as const,
      },
      {
        description: "Starbucks",
        amount: 22.50,
        categoryId: foodCategory._id,
        date: new Date(2025, 5, 15),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 48.90,
        categoryId: transportCategory._id,
        date: new Date(2025, 5, 8),
        type: "expense" as const,
      },
      {
        description: "Car Maintenance",
        amount: 185.00,
        categoryId: transportCategory._id,
        date: new Date(2025, 5, 20),
        type: "expense" as const,
      },
      {
        description: "Home Depot",
        amount: 89.50,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 5, 10),
        type: "expense" as const,
      },
      {
        description: "Movie Theater",
        amount: 35.00,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 5, 18),
        type: "expense" as const,
      },
      {
        description: "Gym Membership",
        amount: 45.00,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 5, 1),
        type: "expense" as const,
      },

      // MAY 2025
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 4, 1),
        type: "income" as const,
      },
      {
        description: "Tax Refund",
        amount: 1850,
        categoryId: salaryCategory._id,
        date: new Date(2025, 4, 15),
        type: "income" as const,
      },

      // May Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 4, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 125,
        categoryId: housingCategory._id,
        date: new Date(2025, 4, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 4, 5),
        type: "expense" as const,
      },
      {
        description: "Grocery Shopping",
        amount: 195.30,
        categoryId: foodCategory._id,
        date: new Date(2025, 4, 6),
        type: "expense" as const,
      },
      {
        description: "Weekend Dining",
        amount: 78.20,
        categoryId: foodCategory._id,
        date: new Date(2025, 4, 14),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 55.80,
        categoryId: transportCategory._id,
        date: new Date(2025, 4, 10),
        type: "expense" as const,
      },
      {
        description: "Electronics Store",
        amount: 320.00,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 4, 20),
        type: "expense" as const,
      },
      {
        description: "Spotify Premium",
        amount: 9.99,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 4, 1),
        type: "expense" as const,
      },
      {
        description: "Doctor Visit",
        amount: 150.00,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 4, 25),
        type: "expense" as const,
      },

      // APRIL 2025
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 3, 1),
        type: "income" as const,
      },

      // April Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 3, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 110,
        categoryId: housingCategory._id,
        date: new Date(2025, 3, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 3, 5),
        type: "expense" as const,
      },
      {
        description: "Grocery Shopping",
        amount: 180.50,
        categoryId: foodCategory._id,
        date: new Date(2025, 3, 8),
        type: "expense" as const,
      },
      {
        description: "Restaurant Week",
        amount: 95.75,
        categoryId: foodCategory._id,
        date: new Date(2025, 3, 18),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 62.40,
        categoryId: transportCategory._id,
        date: new Date(2025, 3, 12),
        type: "expense" as const,
      },
      {
        description: "Spring Clothes",
        amount: 225.00,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 3, 22),
        type: "expense" as const,
      },
      {
        description: "Gaming Subscription",
        amount: 14.99,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 3, 1),
        type: "expense" as const,
      },
      {
        description: "Dental Cleaning",
        amount: 125.00,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 3, 28),
        type: "expense" as const,
      },

      // MARCH 2025
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 2, 1),
        type: "income" as const,
      },
      {
        description: "Bonus",
        amount: 2500,
        categoryId: salaryCategory._id,
        date: new Date(2025, 2, 15),
        type: "income" as const,
      },

      // March Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 2, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 95,
        categoryId: housingCategory._id,
        date: new Date(2025, 2, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 2, 5),
        type: "expense" as const,
      },
      {
        description: "Grocery Shopping",
        amount: 165.75,
        categoryId: foodCategory._id,
        date: new Date(2025, 2, 10),
        type: "expense" as const,
      },
      {
        description: "Birthday Dinner",
        amount: 120.00,
        categoryId: foodCategory._id,
        date: new Date(2025, 2, 25),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 58.90,
        categoryId: transportCategory._id,
        date: new Date(2025, 2, 15),
        type: "expense" as const,
      },
      {
        description: "Online Shopping",
        amount: 175.50,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 2, 20),
        type: "expense" as const,
      },
      {
        description: "Theater Show",
        amount: 85.00,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 2, 12),
        type: "expense" as const,
      },
      {
        description: "Prescription",
        amount: 35.50,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 2, 18),
        type: "expense" as const,
      },

      // FEBRUARY 2025
      // Income
      {
        description: "Monthly Salary",
        amount: 5200,
        categoryId: salaryCategory._id,
        date: new Date(2025, 1, 1),
        type: "income" as const,
      },

      // February Expenses
      {
        description: "Monthly Rent",
        amount: 1800,
        categoryId: housingCategory._id,
        date: new Date(2025, 1, 1),
        type: "expense" as const,
      },
      {
        description: "Electricity Bill",
        amount: 140,
        categoryId: housingCategory._id,
        date: new Date(2025, 1, 3),
        type: "expense" as const,
      },
      {
        description: "Internet Bill",
        amount: 75,
        categoryId: housingCategory._id,
        date: new Date(2025, 1, 5),
        type: "expense" as const,
      },
      {
        description: "Grocery Shopping",
        amount: 210.25,
        categoryId: foodCategory._id,
        date: new Date(2025, 1, 12),
        type: "expense" as const,
      },
      {
        description: "Valentine's Dinner",
        amount: 145.00,
        categoryId: foodCategory._id,
        date: new Date(2025, 1, 14),
        type: "expense" as const,
      },
      {
        description: "Gas Station",
        amount: 48.60,
        categoryId: transportCategory._id,
        date: new Date(2025, 1, 18),
        type: "expense" as const,
      },
      {
        description: "Winter Coat",
        amount: 285.00,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 1, 8),
        type: "expense" as const,
      },
      {
        description: "Streaming Services",
        amount: 35.97,
        categoryId: entertainmentCategory._id,
        date: new Date(2025, 1, 1),
        type: "expense" as const,
      },
      {
        description: "Gym Membership",
        amount: 45.00,
        categoryId: healthcareCategory._id,
        date: new Date(2025, 1, 1),
        type: "expense" as const,
      },
      {
        description: "Phone Bill",
        amount: 85.00,
        categoryId: shoppingCategory._id,
        date: new Date(2025, 1, 15),
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

    // Create comprehensive budgets for current month (July 2025)
    // Amounts are set to be realistic compared to actual spending patterns
    const sampleBudgets = [
      {
        categoryId: foodCategory._id,
        amount: 2000,  // ₹2,000 budget vs ₹1,840 actual spending
        month: 7,
        year: 2025,
      },
      {
        categoryId: transportCategory._id,
        amount: 600,   // ₹600 budget vs ₹540 actual spending
        month: 7,
        year: 2025,
      },
      {
        categoryId: entertainmentCategory._id,
        amount: 400,   // ₹400 budget vs ₹317 actual spending
        month: 7,
        year: 2025,
      },
      {
        categoryId: shoppingCategory._id,
        amount: 1500,  // ₹1,500 budget vs ₹1,352 actual spending
        month: 7,
        year: 2025,
      },
      {
        categoryId: healthcareCategory._id,
        amount: 500,   // ₹500 budget vs ₹264 actual spending
        month: 7,
        year: 2025,
      },
      {
        categoryId: housingCategory._id,
        amount: 12000, // ₹12,000 budget vs ₹11,997 actual spending
        month: 7,
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

  async getCategoriesByType(type: 'income' | 'expense'): Promise<CategoryType[]> {
    return Array.from(this.categories.values()).filter(category => category.type === type);
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

  async getCategoryExpenses(filter?: { startDate?: Date; endDate?: Date }): Promise<{ category: string; amount: number; color: string }[]> {
    const expensesByCategory = new Map<string, number>();

    // Group expenses by category with date filtering
    Array.from(this.transactions.values())
      .filter(transaction => {
        if (transaction.type !== 'expense') return false;
        
        // Apply date filter if provided
        if (filter?.startDate && transaction.date < filter.startDate) return false;
        if (filter?.endDate && transaction.date > filter.endDate) return false;
        
        return true;
      })
      .forEach(transaction => {
        const current = expensesByCategory.get(transaction.categoryId) || 0;
        expensesByCategory.set(transaction.categoryId, current + Math.abs(transaction.amount));
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

  // Advanced Transaction Features
  async getTransactionsFiltered(filters: {
    categoryId?: string;
    type?: 'income' | 'expense';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionWithCategory[]> {
    let transactions = Array.from(this.transactions.values());

    // Apply filters
    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters.startDate) {
      transactions = transactions.filter(t => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      transactions = transactions.filter(t => t.date <= filters.endDate!);
    }
    if (filters.minAmount !== undefined) {
      transactions = transactions.filter(t => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      transactions = transactions.filter(t => t.amount <= filters.maxAmount!);
    }

    // Add category information
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

    return transactionsWithCategory.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getTransactionsForExport(startDate?: Date, endDate?: Date): Promise<TransactionWithCategory[]> {
    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    return this.getTransactionsFiltered(filters);
  }

  async exportToCSV(data: TransactionWithCategory[]): Promise<string> {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const csvRows = [headers.join(',')];

    data.forEach(transaction => {
      const row = [
        transaction.date.toISOString().split('T')[0],
        `"${transaction.description}"`,
        transaction.amount.toString(),
        transaction.type,
        `"${transaction.category.name}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Advanced Analytics
  async getSpendingTrends(months: number): Promise<{ month: string; income: number; expenses: number; savings: number }[]> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const monthlyTransactions = Array.from(this.transactions.values())
        .filter(t => t.date >= startDate && t.date < endDate);

      const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const savings = income - expenses;

      result.push({
        month: monthNames[startDate.getMonth()],
        income,
        expenses,
        savings,
      });
    }

    return result;
  }

  async getSpendingForecast(months: number): Promise<{ month: string; predicted: number; confidence: number }[]> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Get historical data for the last 6 months
    const historicalData = await this.getSpendingTrends(6);
    
    // Simple linear regression for prediction
    const expenses = historicalData.map(d => d.expenses);
    const avgExpenses = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const trend = expenses.length > 1 ? (expenses[expenses.length - 1] - expenses[0]) / expenses.length : 0;
    
    const result = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const predicted = avgExpenses + (trend * i);
      const confidence = Math.max(0.5, 1 - (i * 0.1)); // Confidence decreases over time
      
      result.push({
        month: monthNames[futureDate.getMonth()],
        predicted: Math.max(0, predicted),
        confidence,
      });
    }

    return result;
  }

  async getBudgetPerformance(): Promise<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    percentageUsed: number;
  }[]> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentBudgets = Array.from(this.budgets.values())
      .filter(b => b.month === currentMonth && b.year === currentYear);

    const performance = [];

    for (const budget of currentBudgets) {
      const category = this.categories.get(budget.categoryId);
      if (!category) continue;

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 1);

      const actualAmount = Array.from(this.transactions.values())
        .filter(t => 
          t.categoryId === budget.categoryId && 
          t.type === 'expense' && 
          t.date >= startDate && 
          t.date < endDate
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const variance = budget.amount - actualAmount;
      const percentageUsed = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;

      performance.push({
        categoryId: budget.categoryId,
        categoryName: category.name,
        budgetAmount: budget.amount,
        actualAmount,
        variance,
        percentageUsed,
      });
    }

    return performance;
  }
}

export const storage = new MongoMemoryStorage();