import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { Platform } from 'react-native';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_uri?: string;
  card_id?: number;
}

export const exportExpensesToCSV = async (expenses: Expense[]) => {
  try {
    // Create CSV header
    const header = 'Date,Category,Description,Amount\n';

    // Create CSV content
    const csvContent = expenses.map(expense => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      const category = expense.category.replace(/,/g, '');
      const description = expense.description.replace(/,/g, '');
      const amount = expense.amount.toFixed(2);
      return `${date},${category},${description},${amount}`;
    }).join('\n');

    // Combine header and content
    const fullContent = header + csvContent;

    if (Platform.OS === 'web') {
      // For web, create a Blob and download it
      const blob = new Blob([fullContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For mobile, save to file and share
      const fileUri = `${FileSystem.documentDirectory}expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, fullContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error exporting expenses:', error);
    throw error;
  }
};