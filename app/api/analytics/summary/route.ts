import { NextResponse } from 'next/server';
import { storage } from '../../../storage';

export async function GET() {
  try {
    const data = await storage.getSummaryStats();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch summary stats' },
      { status: 500 }
    );
  }
}