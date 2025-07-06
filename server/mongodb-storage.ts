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

export class MongoDBStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await connectToMongoDB();
      await this.initializeDefaultCategories();
      await this.initializeSampleData();
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

  private async initializeSampleData() {
    try {
      const existingTransactions = await Transaction.countDocuments();
      
      if (existingTransactions === 0) {
        const categories = await Category.find().lean();
        const categoryMap = categories.reduce((acc, cat) => {
          acc[cat.name] = cat._id;
          return acc;
        }, {} as any);

        // Generate 6 months of sample data
        const sampleTransactions = [];
        const currentDate = new Date();
        
        for (let month = 0; month < 6; month++) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - month, 1);
          
          // Monthly salary
          sampleTransactions.push({
            description: "Monthly Salary",
            amount: 5000,
            categoryId: categoryMap["Income"],
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
            type: "income"
          });

          // Freelance income
          if (Math.random() > 0.7) {
            sampleTransactions.push({
              description: "Freelance Project",
              amount: 800 + Math.random() * 1200,
              categoryId: categoryMap["Income"],
              date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
              type: "income"
            });
          }

          // Regular expenses
          const expenses = [
            { desc: "Rent", amount: 1200, category: "Housing", day: 1 },
            { desc: "Groceries", amount: 300 + Math.random() * 200, category: "Food & Dining", day: 5 },
            { desc: "Gas", amount: 60 + Math.random() * 40, category: "Transportation", day: 8 },
            { desc: "Phone Bill", amount: 80, category: "Other", day: 10 },
            { desc: "Internet", amount: 50, category: "Other", day: 12 },
            { desc: "Restaurant", amount: 40 + Math.random() * 80, category: "Food & Dining", day: 15 },
            { desc: "Movie Night", amount: 25, category: "Entertainment", day: 18 },
            { desc: "Clothing", amount: 100 + Math.random() * 150, category: "Shopping", day: 20 },
            { desc: "Doctor Visit", amount: 120, category: "Healthcare", day: 22 },
            { desc: "Coffee", amount: 5 + Math.random() * 10, category: "Food & Dining", day: 25 },
          ];

          expenses.forEach(expense => {
            if (Math.random() > 0.2) { // 80% chance to have this expense
              sampleTransactions.push({
                description: expense.desc,
                amount: expense.amount,
                categoryId: categoryMap[expense.category],
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), expense.day),
                type: "expense"
              });
            }
          });

          // Random additional transactions
          for (let i = 0; i < 3 + Math.random() * 7; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const isIncome = randomCategory.name === "Income" || Math.random() > 0.9;
            
            sampleTransactions.push({
              description: isIncome ? "Additional Income" : "Miscellaneous Expense",
              amount: 20 + Math.random() * 200,
              categoryId: randomCategory._id,
              date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 + Math.random() * 28),
              type: isIncome ? "income" : "expense"
            });
          }
        }

        await Transaction.insertMany(sampleTransactions);
        console.log(`${sampleTransactions.length} sample transactions initialized`);

        // Initialize sample budgets for current month
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const sampleBudgets = [
          { categoryId: categoryMap["Food & Dining"], amount: 600, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Transportation"], amount: 200, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Housing"], amount: 1300, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Entertainment"], amount: 150, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Shopping"], amount: 300, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Healthcare"], amount: 200, month: currentMonth, year: currentYear },
          { categoryId: categoryMap["Other"], amount: 250, month: currentMonth, year: currentYear },
        ];

        await Budget.insertMany(sampleBudgets);
        console.log('Sample budgets initialized');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
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

  // Advanced Transaction Features
  async getTransactionsFiltered(filters: {
    categoryId?: string;
    type?: 'income' | 'expense';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionWithCategory[]> {
    const matchQuery: any = {};

    if (filters.categoryId) matchQuery.categoryId = filters.categoryId;
    if (filters.type) matchQuery.type = filters.type;
    if (filters.startDate || filters.endDate) {
      matchQuery.date = {};
      if (filters.startDate) matchQuery.date.$gte = filters.startDate;
      if (filters.endDate) matchQuery.date.$lte = filters.endDate;
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      matchQuery.amount = {};
      if (filters.minAmount !== undefined) matchQuery.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) matchQuery.amount.$lte = filters.maxAmount;
    }

    const transactions = await Transaction.find(matchQuery)
      .populate('categoryId')
      .sort({ date: -1 })
      .lean();

    return transactions.map(transaction => ({
      ...this.transformTransaction(transaction),
      category: this.transformCategory(transaction.categoryId),
    }));
  }

  async getTransactionsForExport(startDate?: Date, endDate?: Date): Promise<TransactionWithCategory[]> {
    const matchQuery: any = {};
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    }

    const transactions = await Transaction.find(matchQuery)
      .populate('categoryId')
      .sort({ date: -1 })
      .lean();

    return transactions.map(transaction => ({
      ...this.transformTransaction(transaction),
      category: this.transformCategory(transaction.categoryId),
    }));
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

      const monthlyData = await Transaction.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);

      const income = monthlyData.find(d => d._id === 'income')?.total || 0;
      const expenses = monthlyData.find(d => d._id === 'expense')?.total || 0;
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

    const budgets = await Budget.find({
      month: currentMonth,
      year: currentYear
    }).populate('categoryId').lean();

    const performance = [];

    for (const budget of budgets) {
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 1);

      const actualExpenses = await Transaction.aggregate([
        {
          $match: {
            categoryId: budget.categoryId._id,
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

      const actualAmount = actualExpenses[0]?.total || 0;
      const variance = budget.amount - actualAmount;
      const percentageUsed = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;

      performance.push({
        categoryId: budget.categoryId._id.toString(),
        categoryName: budget.categoryId.name,
        budgetAmount: budget.amount,
        actualAmount,
        variance,
        percentageUsed,
      });
    }

    return performance;
  }
}

export const storage = new MongoDBStorage();