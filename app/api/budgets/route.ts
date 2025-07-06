import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../storage';
import { insertBudgetSchema } from '../../../shared/schema';
import { z } from 'zod';

export async function GET() {
  try {
    const budgets = await storage.getBudgets();
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insertBudgetSchema.parse(body);
    const budget = await storage.createBudget(parsed);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid budget data', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { message: 'Failed to create budget' },
      { status: 500 }
    );
  }
}