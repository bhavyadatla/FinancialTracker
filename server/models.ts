import mongoose, { Schema, Document } from 'mongoose';

// Category interface and schema
export interface ICategory extends Document {
  name: string;
  color: string;
  icon: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
});

// Transaction interface and schema
export interface ITransaction extends Document {
  description: string;
  amount: number;
  categoryId: mongoose.Types.ObjectId;
  date: Date;
  type: 'income' | 'expense';
}

const TransactionSchema = new Schema<ITransaction>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
});

// Budget interface and schema
export interface IBudget extends Document {
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
}

const BudgetSchema = new Schema<IBudget>({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
});

// Export models
export const Category = mongoose.model<ICategory>('Category', CategorySchema);
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);