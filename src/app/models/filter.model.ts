export interface DateFilter {
  label: string;
  value: 'day' | 'week' | 'month' | 'year';
  days: number;
} 