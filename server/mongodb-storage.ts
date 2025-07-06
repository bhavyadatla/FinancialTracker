import { connectToMongoDB } from './mongodb';
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

export class MongoDBStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await connectToMongoDB();
      await this.initializeDefaultCategories();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async initializeDefaultCategories() {
    try {
      const existingCategories = await Category.countDocuments();
      
      if (existingCategories === 0) {
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

        await Category.insertMany(defaultCategories);
        console.log('Default categories initialized');
      }
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  }

  private transformCategory(doc: any): CategoryType {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      color: doc.color,
      icon: doc.icon,
    };
  }

  private transformTransaction(doc: any, category?: any): TransactionType {
    return {
      _id: doc._id.toString(),
      description: doc.description,
      amount: doc.amount,
      categoryId: doc.categoryId.toString(),
      date: doc.date,
      type: doc.type,
    };
  }

  private transformBudget(doc: any): BudgetType {
    return {
      _id: doc._id.toString(),
      categoryId: doc.categoryId.toString(),
      amount: doc.amount,
      month: doc.month,
      year: doc.year,
    };
  }

  // Categories
  async getCategories(): Promise<CategoryType[]> {
    const categories = await Category.find().lean();
    return categories.map(this.transformCategory);
  }

  async getCategoryById(id: string): Promise<CategoryType | undefined> {
    const category = await Category.findById(id).lean();
    return category ? this.transformCategory(category) : undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    const category = new Category(insertCategory);
    const savedCategory = await category.save();
    return this.transformCategory(savedCategory);
  }

  // Transactions
  async getTransactions(): Promise<TransactionWithCategory[]> {
    const transactions = await Transaction.find()
      .populate('categoryId')
      .sort({ date: -1 })
      .lean();

    return transactions.map(transaction => ({
      ...this.transformTransaction(transaction),
      category: this.transformCategory(transaction.categoryId),
    }));
  }

  async getTransactionById(id: string): Promise<TransactionWithCategory | undefined> {
    const transaction = await Transaction.findById(id)
      .populate('categoryId')
      .lean();

    if (!transaction) return undefined;

    return {
      ...this.transformTransaction(transaction),
      category: this.transformCategory(transaction.categoryId),
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionType> {
    const transactionData = {
      ...insertTransaction,
      date: new Date(insertTransaction.date),
    };

    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    return this.transformTransaction(savedTransaction);
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<TransactionType | undefined> {
    const updateData: any = { ...updates };
    
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    return transaction ? this.transformTransaction(transaction) : undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await Transaction.findByIdAndDelete(id);
    return !!result;
  }

  // Budgets
  async getBudgets(): Promise<BudgetWithCategory[]> {
    const budgets = await Budget.find()
      .populate('categoryId')
      .lean();

    return budgets.map(budget => ({
      ...this.transformBudget(budget),
      category: this.transformCategory(budget.categoryId),
    }));
  }

  async getBudgetById(id: string): Promise<BudgetWithCategory | undefined> {
    const budget = await Budget.findById(id)
      .populate('categoryId')
      .lean();

    if (!budget) return undefined;

    return {
      ...this.transformBudget(budget),
      category: this.transformCategory(budget.categoryId),
    };
  }

  async createBudget(insertBudget: InsertBudget): Promise<BudgetType> {
    const budget = new Budget(insertBudget);
    const savedBudget = await budget.save();
    return this.transformBudget(savedBudget);
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<BudgetType | undefined> {
    const budget = await Budget.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).lean();

    return budget ? this.transformBudget(budget) : undefined;
  }

  async deleteBudget(id: string): Promise<boolean> {
    const result = await Budget.findByIdAndDelete(id);
    return !!result;
  }

  // Analytics
  async getMonthlyExpenses(months: number): Promise<{ month: string; amount: number }[]> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const expenses = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      result.push({
        month: monthNames[startDate.getMonth()],
        amount: expenses[0]?.total || 0,
      });
    }

    return result;
  }

  async getCategoryExpenses(): Promise<{ category: string; amount: number; color: string }[]> {
    const categoryExpenses = await Transaction.aggregate([
      {
        $match: { type: 'expense' }
      },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $match: { total: { $gt: 0 } }
      }
    ]);

    return categoryExpenses.map(expense => ({
      category: expense.category.name,
      amount: expense.total,
      color: expense.category.color,
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

    // Get total income and expenses
    const totals = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly income and expenses
    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;
    const monthlyIncome = monthlyTotals.find(t => t._id === 'income')?.total || 0;
    const monthlyExpenses = monthlyTotals.find(t => t._id === 'expense')?.total || 0;

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

export const storage = new MongoDBStorage();