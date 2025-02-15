import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, format } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const setupNotifications = async () => {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
};

export const scheduleBudgetAlert = async (
  categoryName: string,
  currentSpending: number,
  budget: number,
  threshold: number
) => {
  if (Platform.OS === 'web') return;

  const percentageSpent = (currentSpending / budget) * 100;
  if (percentageSpent >= threshold) {
    const title = `Budget Alert: ${categoryName}`;
    let body = '';

    if (percentageSpent >= 100) {
      body = `You've exceeded your budget for ${categoryName}! You've spent $${currentSpending.toFixed(2)} of your $${budget.toFixed(2)} budget.`;
    } else {
      body = `You've used ${percentageSpent.toFixed(0)}% of your ${categoryName} budget. $${(budget - currentSpending).toFixed(2)} remaining.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'budget', categoryName, currentSpending, budget },
      },
      trigger: null,
    });
  }
};

export const scheduleRecurringExpenseReminder = async (
  expenseId: number,
  description: string,
  amount: number,
  dueDate: string
) => {
  if (Platform.OS === 'web') return;

  // Schedule reminders at different intervals
  const reminderDates = [
    { days: 7, id: `${expenseId}-7days` },
    { days: 3, id: `${expenseId}-3days` },
    { days: 1, id: `${expenseId}-1day` },
    { days: 0, id: `${expenseId}-dueday` },
  ];

  for (const reminder of reminderDates) {
    const triggerDate = addDays(new Date(dueDate), -reminder.days);
    if (triggerDate > new Date()) {
      let title = 'Upcoming Payment';
      let body = '';

      if (reminder.days === 0) {
        title = 'Payment Due Today';
        body = `${description} - $${amount.toFixed(2)} is due today!`;
      } else {
        body = `${description} - $${amount.toFixed(2)} is due in ${reminder.days} day${
          reminder.days > 1 ? 's' : ''
        } (${format(new Date(dueDate), 'PP')})`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'recurring',
            expenseId,
            description,
            amount,
            dueDate,
          },
        },
        trigger: {
          date: triggerDate,
        },
        identifier: reminder.id,
      });
    }
  }
};

export const scheduleMonthlyBudgetReminder = async () => {
  if (Platform.OS === 'web') return;

  // Schedule for the 1st of each month at 9 AM
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Monthly Budget Review',
      body: 'Time to review and set your budgets for the new month!',
      data: { type: 'monthly-budget' },
    },
    trigger: {
      date: nextMonth,
      repeats: true,
    },
    identifier: 'monthly-budget',
  });
};

export const scheduleWeeklySpendingDigest = async () => {
  if (Platform.OS === 'web') return;

  // Schedule for every Sunday at 6 PM
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));
  nextSunday.setHours(18, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Spending Summary',
      body: 'Check your spending patterns and stay on track with your budgets.',
      data: { type: 'weekly-digest' },
    },
    trigger: {
      date: nextSunday,
      repeats: true,
    },
    identifier: 'weekly-digest',
  });
};

export const cancelRecurringExpenseReminders = async (expenseId: number) => {
  if (Platform.OS === 'web') return;

  const reminderIds = [
    `${expenseId}-7days`,
    `${expenseId}-3days`,
    `${expenseId}-1day`,
    `${expenseId}-dueday`,
  ];

  for (const id of reminderIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};