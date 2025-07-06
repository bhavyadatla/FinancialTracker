import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');
    const data = await storage.getMonthlyExpenses(months);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch monthly expenses' },
      { status: 500 }
    );
  }
}