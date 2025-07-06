import { z } from "zod";

// MongoDB-compatible types
export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
  type: 'income' | 'expense';
}

export interface Budget {
  _id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

// Insert schemas for validation
export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
});

export const insertTransactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
});

export const insertBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Extended types for UI
export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type BudgetWithCategory = Budget & {
  category: Category;
};