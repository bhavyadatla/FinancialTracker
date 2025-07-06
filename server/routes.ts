import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mongo-memory-storage";
import { insertTransactionSchema, insertBudgetSchema } from "../shared/mongodb-types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:type", async (req, res) => {
    try {
      const type = req.params.type as 'income' | 'expense';
      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
      }
      const categories = await storage.getCategoriesByType(type);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const transaction = await storage.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const parsed = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(parsed);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const parsed = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, parsed);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Advanced filtering endpoint
  app.get("/api/transactions/filter", async (req, res) => {
    try {
      const { category, type, startDate, endDate, minAmount, maxAmount } = req.query;
      const transactions = await storage.getTransactionsFiltered({
        categoryId: category as string,
        type: type as 'income' | 'expense',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter transactions" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budgets
  app.get("/api/budgets", async (_req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.patch("/api/budgets/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const parsed = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, parsed);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const parsed = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(parsed);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Analytics
  app.get("/api/analytics/monthly-expenses", async (req, res) => {
    try {
      const filter = req.query.filter as string;
      let months = parseInt(req.query.months as string) || 6;
      
      // Override months based on filter
      if (filter) {
        switch (filter) {
          case 'last-1-day':
            months = 1;
            break;
          case 'this-month':
          case 'last-month':
            months = 1;
            break;
          case 'last-3-months':
            months = 3;
            break;
          case 'last-6-months':
            months = 6;
            break;
          case 'this-year':
            months = 12;
            break;
        }
      }
      
      const data = await storage.getMonthlyExpenses(months);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly expenses" });
    }
  });

  app.get("/api/analytics/category-expenses", async (req, res) => {
    try {
      const filter = req.query.filter as string;
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (filter) {
        const now = new Date();
        switch (filter) {
          case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          case 'last-3-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = now;
            break;
          case 'last-6-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            endDate = now;
            break;
          case 'this-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = now;
            break;
          case 'last-1-day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            endDate = now;
            break;
        }
      }

      const data = await storage.getCategoryExpenses({ startDate, endDate });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category expenses" });
    }
  });

  app.get("/api/analytics/summary", async (_req, res) => {
    try {
      const data = await storage.getSummaryStats();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary stats" });
    }
  });

  // Advanced analytics endpoints
  app.get("/api/analytics/trends", async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const data = await storage.getSpendingTrends(months);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending trends" });
    }
  });

  app.get("/api/analytics/forecast", async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 3;
      const data = await storage.getSpendingForecast(months);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate forecast" });
    }
  });

  app.get("/api/analytics/budget-performance", async (_req, res) => {
    try {
      const data = await storage.getBudgetPerformance();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget performance" });
    }
  });

  // Data export endpoints
  app.get("/api/export/transactions", async (req, res) => {
    try {
      const format = req.query.format as string || 'json';
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const data = await storage.getTransactionsForExport(startDate, endDate);
      
      if (format === 'csv') {
        const csv = await storage.exportToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        res.send(csv);
      } else {
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
