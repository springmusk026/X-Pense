import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export const calculateNextOccurrence = (
  lastGenerated: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number
): Date => {
  let nextDate = new Date(lastGenerated);
  switch (frequency) {
    case 'daily':
      nextDate = addDays(nextDate, interval);
      break;
    case 'weekly':
      nextDate = addWeeks(nextDate, interval);
      break;
    case 'monthly':
      nextDate = addMonths(nextDate, interval);
      break;
    case 'yearly':
      nextDate = addYears(nextDate, interval);
      break;
  }
  return nextDate;
};
