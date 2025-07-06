import { format, startOfMonth, endOfMonth, subMonths, isAfter, isBefore, isEqual } from 'date-fns';

export type DateFilter = 'all' | 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year';

export function getDateRange(filter: DateFilter): { start: Date; end: Date } {
  const now = new Date();
  
  switch (filter) {
    case 'this-month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    
    case 'last-month':
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      };
    
    case 'last-3-months':
      return {
        start: startOfMonth(subMonths(now, 3)),
        end: endOfMonth(now)
      };
    
    case 'last-6-months':
      return {
        start: startOfMonth(subMonths(now, 6)),
        end: endOfMonth(now)
      };
    
    case 'this-year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31)
      };
    
    default:
      return {
        start: new Date(2020, 0, 1),
        end: new Date(2030, 11, 31)
      };
  }
}

export function formatDateForDisplay(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateForChart(date: Date): string {
  return format(date, 'MMM yyyy');
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return (isAfter(date, start) || isEqual(date, start)) && 
         (isBefore(date, end) || isEqual(date, end));
}