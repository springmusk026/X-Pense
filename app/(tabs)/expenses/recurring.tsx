import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchRecurringExpenses,
  deleteRecurringExpense,
} from '../../../store/slices/recurringExpensesSlice';

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function RecurringExpensesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const recurringExpenses = useSelector(
    (state: RootState) => state.recurringExpenses.items
  );
  const categories = useSelector((state: RootState) => state.categories.items);

  useEffect(() => {
    dispatch(fetchRecurringExpenses());
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteRecurringExpense(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
    }
  };

  return (
    <View style={styles.container}>
      
      <ScrollView style={styles.content}>
        {recurringExpenses.map((recurring) => (
          <View key={recurring.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View style={styles.categoryInfo}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={
                      (categories.find((c) => c.name === recurring.category)?.icon ||
                      'cash')  as any
                    }
                    size={24}
                    color={
                      categories.find((c) => c.name === recurring.category)?.color
                    }
                  />
                </View>
                <View>
                  <Text style={styles.expenseCategory}>{recurring.category}</Text>
                  <Text style={styles.expenseDescription}>
                    {recurring.description}
                  </Text>
                </View>
              </View>
              <Text style={styles.expenseAmount}>
                ${recurring.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View style={styles.expenseDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={16}
                  color="#757575"
                />
                <Text style={styles.detailText}>
                  {FREQUENCY_LABELS[recurring.frequency]  as any}
                  {recurring.interval > 1 ? ` (every ${recurring.interval} ${recurring.frequency.slice(0, -2)}s)` : ''}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#757575"
                />
                <Text style={styles.detailText}>
                  Started {format(new Date(recurring.start_date), 'PP')}
                </Text>
              </View>

              {recurring.end_date && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="calendar-end"
                    size={16}
                    color="#757575"
                  />
                  <Text style={styles.detailText}>
                    Ends {format(new Date(recurring.end_date), 'PP')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.expenseActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/expenses/recurring/edit',
                    params: { id: recurring.id },
                  })
                }
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#4A90E2" />
                <Text style={[styles.actionText, { color: '#4A90E2' }]}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(recurring.id)}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color="#FF6B6B"
                />
                <Text style={[styles.actionText, { color: '#FF6B6B' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {recurringExpenses.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="refresh-circle"
              size={64}
              color="#757575"
            />
            <Text style={styles.emptyStateText}>
              No recurring expenses set up yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add recurring expenses for bills and regular payments
            </Text>
          </View>
        )}
      </ScrollView>

      <Link href="/(tabs)/expenses/recurring/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D43',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseCategory: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2A2D43',
    letterSpacing: -0.3,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2D43',
  },
  expenseDetails: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#757575',
    marginLeft: 8,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  actionText: {
    fontSize: 15,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
