import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../storage';
import { insertTransactionSchema } from '../../../shared/schema';
import { z } from 'zod';

export async function GET() {
  try {
    const transactions = await storage.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insertTransactionSchema.parse(body);
    const transaction = await storage.createTransaction(parsed);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid transaction data', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { message: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}