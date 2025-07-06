import mongoose from 'mongoose';
import { Category, Transaction, Budget } from './models';
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
  getCategoryExpenses(filter?: { startDate?: Date; endDate?: Date }): Promise<{ category: string; amount: number; color: string }[]>;
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

export class MongoDBStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Initialize with sample data if collections are empty
      const categoryCount = await Category.countDocuments();
      if (categoryCount === 0) {
        await this.initializeDefaultCategories();
        await this.initializeSampleData();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MongoDB storage:', error);
    }
  }

  private async initializeDefaultCategories() {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#f97316', icon: 'utensils', type: 'expense' },
      { name: 'Transportation', color: '#eab308', icon: 'car', type: 'expense' },
      { name: 'Housing', color: '#8b5cf6', icon: 'home', type: 'expense' },
      { name: 'Entertainment', color: '#3b82f6', icon: 'film', type: 'expense' },
      { name: 'Shopping', color: '#ec4899', icon: 'shopping-bag', type: 'expense' },
      { name: 'Income', color: '#10b981', icon: 'trending-up', type: 'income' },
      { name: 'Healthcare', color: '#06b6d4', icon: 'heart', type: 'expense' },
      { name: 'Other', color: '#6b7280', icon: 'more-horizontal', type: 'expense' }
    ];

    await Category.insertMany(defaultCategories);
  }

  private async initializeSampleData() {
    const categories = await Category.find();
    const categoryMap = new Map(categories.map(cat => [cat.name, cat._id.toString()]));

    // Sample transactions
    const sampleTransactions = [
      { description: 'Salary', amount: 5000, categoryId: categoryMap.get('Income'), date: new Date('2024-07-01'), type: 'income' },
      { description: 'Freelance Work', amount: 1500, categoryId: categoryMap.get('Income'), date: new Date('2024-07-05'), type: 'income' },
      { description: 'Grocery Shopping', amount: -120, categoryId: categoryMap.get('Food & Dining'), date: new Date('2024-07-02'), type: 'expense' },
      { description: 'Gas Bill', amount: -80, categoryId: categoryMap.get('Transportation'), date: new Date('2024-07-03'), type: 'expense' },
      { description: 'Rent', amount: -1200, categoryId: categoryMap.get('Housing'), date: new Date('2024-07-01'), type: 'expense' },
      { description: 'Movie Tickets', amount: -25, categoryId: categoryMap.get('Entertainment'), date: new Date('2024-07-04'), type: 'expense' },
      { description: 'Clothes Shopping', amount: -85, categoryId: categoryMap.get('Shopping'), date: new Date('2024-07-06'), type: 'expense' },
      { description: 'Doctor Visit', amount: -150, categoryId: categoryMap.get('Healthcare'), date: new Date('2024-07-07'), type: 'expense' },
      // Previous months data
      { description: 'Monthly Salary', amount: 5000, categoryId: categoryMap.get('Income'), date: new Date('2024-06-01'), type: 'income' },
      { description: 'Consulting', amount: 800, categoryId: categoryMap.get('Income'), date: new Date('2024-06-15'), type: 'income' },
      { description: 'Rent', amount: -1200, categoryId: categoryMap.get('Housing'), date: new Date('2024-06-01'), type: 'expense' },
      { description: 'Groceries', amount: -300, categoryId: categoryMap.get('Food & Dining'), date: new Date('2024-06-15'), type: 'expense' },
      { description: 'Car Maintenance', amount: -250, categoryId: categoryMap.get('Transportation'), date: new Date('2024-06-10'), type: 'expense' },
    ];

    await Transaction.insertMany(sampleTransactions);

    // Sample budgets
    const sampleBudgets = [
      { categoryId: categoryMap.get('Food & Dining'), amount: 500, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Transportation'), amount: 300, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Entertainment'), amount: 200, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Shopping'), amount: 250, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Healthcare'), amount: 150, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Housing'), amount: 2100, month: 7, year: 2024 },
      { categoryId: categoryMap.get('Other'), amount: 100, month: 7, year: 2024 },
    ];

    await Budget.insertMany(sampleBudgets);
  }

  async getCategories(): Promise<CategoryType[]> {
    await this.ensureInitialized();
    const categories = await Category.find().lean();
    return categories.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type
    }));
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<CategoryType[]> {
    await this.ensureInitialized();
    const categories = await Category.find({ type }).lean();
    return categories.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type
    }));
  }

  async getCategoryById(id: string): Promise<CategoryType | undefined> {
    await this.ensureInitialized();
    const category = await Category.findById(id).lean();
    if (!category) return undefined;
    return {
      _id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type
    };
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    await this.ensureInitialized();
    const category = new Category(insertCategory);
    await category.save();
    return {
      _id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type
    };
  }

  async getTransactions(): Promise<TransactionWithCategory[]> {
    await this.ensureInitialized();
    const transactions = await Transaction.find().populate('categoryId').lean();
    return transactions.map(tx => ({
      _id: tx._id.toString(),
      description: tx.description,
      amount: tx.amount,
      categoryId: tx.categoryId._id.toString(),
      date: tx.date,
      type: tx.type,
      category: {
        _id: tx.categoryId._id.toString(),
        name: tx.categoryId.name,
        color: tx.categoryId.color,
        icon: tx.categoryId.icon,
        type: tx.categoryId.type
      }
    }));
  }

  async getTransactionById(id: string): Promise<TransactionWithCategory | undefined> {
    await this.ensureInitialized();
    const transaction = await Transaction.findById(id).populate('categoryId').lean();
    if (!transaction) return undefined;
    return {
      _id: transaction._id.toString(),
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId._id.toString(),
      date: transaction.date,
      type: transaction.type,
      category: {
        _id: transaction.categoryId._id.toString(),
        name: transaction.categoryId.name,
        color: transaction.categoryId.color,
        icon: transaction.categoryId.icon,
        type: transaction.categoryId.type
      }
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionType> {
    await this.ensureInitialized();
    const transaction = new Transaction(insertTransaction);
    await transaction.save();
    return {
      _id: transaction._id.toString(),
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId.toString(),
      date: transaction.date,
      type: transaction.type
    };
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<TransactionType | undefined> {
    await this.ensureInitialized();
    const transaction = await Transaction.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!transaction) return undefined;
    return {
      _id: transaction._id.toString(),
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId.toString(),
      date: transaction.date,
      type: transaction.type
    };
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await Transaction.findByIdAndDelete(id);
    return !!result;
  }

  async getTransactionsFiltered(filters: {
    categoryId?: string;
    type?: 'income' | 'expense';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionWithCategory[]> {
    await this.ensureInitialized();
    
    const query: any = {};
    
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.type) query.type = filters.type;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const transactions = await Transaction.find(query).populate('categoryId').lean();
    return transactions.map(tx => ({
      _id: tx._id.toString(),
      description: tx.description,
      amount: tx.amount,
      categoryId: tx.categoryId._id.toString(),
      date: tx.date,
      type: tx.type,
      category: {
        _id: tx.categoryId._id.toString(),
        name: tx.categoryId.name,
        color: tx.categoryId.color,
        icon: tx.categoryId.icon,
        type: tx.categoryId.type
      }
    }));
  }

  async getTransactionsForExport(startDate?: Date, endDate?: Date): Promise<TransactionWithCategory[]> {
    return this.getTransactionsFiltered({ startDate, endDate });
  }

  async exportToCSV(data: TransactionWithCategory[]): Promise<string> {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = data.map(tx => [
      tx.date.toISOString().split('T')[0],
      tx.description,
      tx.category.name,
      tx.type,
      tx.amount.toString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async getBudgets(): Promise<BudgetWithCategory[]> {
    await this.ensureInitialized();
    const budgets = await Budget.find().populate('categoryId').lean();
    return budgets.map(budget => ({
      _id: budget._id.toString(),
      categoryId: budget.categoryId._id.toString(),
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      category: {
        _id: budget.categoryId._id.toString(),
        name: budget.categoryId.name,
        color: budget.categoryId.color,
        icon: budget.categoryId.icon,
        type: budget.categoryId.type
      }
    }));
  }

  async getBudgetById(id: string): Promise<BudgetWithCategory | undefined> {
    await this.ensureInitialized();
    const budget = await Budget.findById(id).populate('categoryId').lean();
    if (!budget) return undefined;
    return {
      _id: budget._id.toString(),
      categoryId: budget.categoryId._id.toString(),
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      category: {
        _id: budget.categoryId._id.toString(),
        name: budget.categoryId.name,
        color: budget.categoryId.color,
        icon: budget.categoryId.icon,
        type: budget.categoryId.type
      }
    };
  }

  async createBudget(insertBudget: InsertBudget): Promise<BudgetType> {
    await this.ensureInitialized();
    const budget = new Budget(insertBudget);
    await budget.save();
    return {
      _id: budget._id.toString(),
      categoryId: budget.categoryId.toString(),
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    };
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<BudgetType | undefined> {
    await this.ensureInitialized();
    const budget = await Budget.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!budget) return undefined;
    return {
      _id: budget._id.toString(),
      categoryId: budget.categoryId.toString(),
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    };
  }

  async deleteBudget(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await Budget.findByIdAndDelete(id);
    return !!result;
  }

  async getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]> {
    await this.ensureInitialized();
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const transactions = await Transaction.find({
      type: 'expense',
      date: { $gte: startDate }
    }).lean();

    const monthlyData = new Map<string, number>();
    
    transactions.forEach(tx => {
      const month = tx.date.toLocaleDateString('en-US', { month: 'short' });
      const currentAmount = monthlyData.get(month) || 0;
      monthlyData.set(month, currentAmount + Math.abs(tx.amount));
    });

    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  async getCategoryExpenses(filter?: { startDate?: Date; endDate?: Date }): Promise<{ category: string; amount: number; color: string }[]> {
    await this.ensureInitialized();
    
    const query: any = { type: 'expense' };
    if (filter?.startDate || filter?.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = filter.startDate;
      if (filter.endDate) query.date.$lte = filter.endDate;
    }

    const transactions = await Transaction.find(query).populate('categoryId').lean();
    const categoryTotals = new Map<string, { amount: number; color: string }>();

    transactions.forEach(tx => {
      const categoryName = tx.categoryId.name;
      const current = categoryTotals.get(categoryName) || { amount: 0, color: tx.categoryId.color };
      current.amount += Math.abs(tx.amount);
      categoryTotals.set(categoryName, current);
    });

    return Array.from(categoryTotals.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      color: data.color
    }));
  }

  async getSummaryStats(): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    await this.ensureInitialized();
    
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const [income, expenses] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'income', date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense', date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const monthlyIncome = income[0]?.total || 0;
    const monthlyExpenses = Math.abs(expenses[0]?.total || 0);
    const totalBalance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate
    };
  }

  async getSpendingTrends(months: number): Promise<{ month: string; income: number; expenses: number; savings: number }[]> {
    await this.ensureInitialized();
    
    const trends: { month: string; income: number; expenses: number; savings: number }[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const [income, expenses] = await Promise.all([
        Transaction.aggregate([
          { $match: { type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.aggregate([
          { $match: { type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const monthIncome = income[0]?.total || 0;
      const monthExpenses = Math.abs(expenses[0]?.total || 0);
      
      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses
      });
    }
    
    return trends;
  }

  async getSpendingForecast(months: number): Promise<{ month: string; predicted: number; confidence: number }[]> {
    await this.ensureInitialized();
    
    // Simple trend-based forecast
    const trends = await this.getSpendingTrends(6);
    const avgExpenses = trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length;
    
    const forecast: { month: string; predicted: number; confidence: number }[] = [];
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      forecast.push({
        month: futureDate.toLocaleDateString('en-US', { month: 'short' }),
        predicted: avgExpenses * (1 + (Math.random() - 0.5) * 0.1), // ±5% variance
        confidence: Math.max(0.5, 1 - (i * 0.1)) // Decreasing confidence over time
      });
    }
    
    return forecast;
  }

  async getBudgetPerformance(): Promise<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    percentageUsed: number;
  }[]> {
    await this.ensureInitialized();
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const budgets = await Budget.find({ month: currentMonth, year: currentYear }).populate('categoryId').lean();
    const performance = [];
    
    for (const budget of budgets) {
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0);
      
      const expenses = await Transaction.aggregate([
        {
          $match: {
            categoryId: budget.categoryId._id,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const actualAmount = Math.abs(expenses[0]?.total || 0);
      const variance = budget.amount - actualAmount;
      const percentageUsed = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;
      
      performance.push({
        categoryId: budget.categoryId._id.toString(),
        categoryName: budget.categoryId.name,
        budgetAmount: budget.amount,
        actualAmount,
        variance,
        percentageUsed
      });
    }
    
    return performance;
  }
}

export const storage = new MongoDBStorage();