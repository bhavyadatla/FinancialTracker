import { NextResponse } from 'next/server';
import { storage } from '../../../storage';

export async function GET() {
  try {
    const data = await storage.getCategoryExpenses();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching category expenses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch category expenses' },
      { status: 500 }
    );
  }
}