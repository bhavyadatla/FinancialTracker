import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimeFilterType = 
  | '1-day' | '2-days' | '5-days' | '7-days' | '2-weeks' 
  | '1-month' | '2-months' | '3-months' | '4-months' | '5-months';

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (value: TimeFilterType) => void;
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const timeOptions = [
    { value: '1-day', label: 'Last 1 Day' },
    { value: '2-days', label: 'Last 2 Days' },
    { value: '5-days', label: 'Last 5 Days' },
    { value: '7-days', label: 'Last 7 Days' },
    { value: '2-weeks', label: 'Last 2 Weeks' },
    { value: '1-month', label: 'Last 1 Month' },
    { value: '2-months', label: 'Last 2 Months' },
    { value: '3-months', label: 'Last 3 Months' },
    { value: '4-months', label: 'Last 4 Months' },
    { value: '5-months', label: 'Last 5 Months' },
  ] as const;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function getDateRangeFromFilter(filter: TimeFilterType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  let start: Date;
  
  switch (filter) {
    case '1-day':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '2-days':
      start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      break;
    case '5-days':
      start = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      break;
    case '7-days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '2-weeks':
      start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    case '1-month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '2-months':
      start = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      break;
    case '3-months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '4-months':
      start = new Date(now.getFullYear(), now.getMonth() - 4, now.getDate());
      break;
    case '5-months':
      start = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  }
  
  return { start, end };
}