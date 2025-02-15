import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RootState } from '../../../store';
import SplitExpenseModal from '../../../components/SplitExpenseModal';

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [showSplitModal, setShowSplitModal] = useState(false);
  const expense = useSelector((state: RootState) =>
    state.expenses.items.find(e => e.id === Number(id))
  );
  const category = useSelector((state: RootState) =>
    state.categories.items.find(c => c.name === expense?.category)
  );
  const splits = useSelector((state: RootState) =>
    state.splitExpenses.items.filter(s => s.expense_id === Number(id))
  );

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text>Expense not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>
            ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.categoryIcon}>
              <MaterialCommunityIcons
                name={(category?.icon || 'cash')  as any}
                size={24}
                color={category?.color || '#757575'}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{expense.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.categoryIcon}>
              <MaterialCommunityIcons name="text" size={24} color="#4A90E2" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{expense.description}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.categoryIcon}>
              <MaterialCommunityIcons name="calendar" size={24} color="#4A90E2" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {format(new Date(expense.date), 'PPP')}
              </Text>
            </View>
          </View>
        </View>

        {expense.receipt_uri && (
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <Image
              source={{ uri: expense.receipt_uri }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}

        {splits.length > 0 ? (
          <View style={styles.splitsCard}>
            <Text style={styles.splitsTitle}>Split Details</Text>
            {splits.map((split) => (
              <View key={split.id} style={styles.splitItem}>
                <View style={styles.splitInfo}>
                  <Text style={styles.splitName}>{split.participant_name}</Text>
                  <Text style={styles.splitAmount}>
                    ${split.amount.toFixed(2)}
                  </Text>
                </View>
                <View style={[
                  styles.splitStatus,
                  split.status === 'paid' && styles.splitStatusPaid,
                ]}>
                  <Text style={[
                    styles.splitStatusText,
                    split.status === 'paid' && styles.splitStatusTextPaid,
                  ]}>
                    {split.status === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.splitButton}
            onPress={() => setShowSplitModal(true)}
          >
            <MaterialCommunityIcons
              name="account-multiple"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.splitButtonText}>Split this expense</Text>
          </TouchableOpacity>
        )}
      </View>

      <SplitExpenseModal
        visible={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        expenseId={Number(id)}
        totalAmount={expense.amount}
      />
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2D43',
  },
  content: {
    padding: 20,
  },
  amountCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  amountLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      },
    }),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 16,
    color: '#2A2D43',
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      },
    }),
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 16,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  splitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  splitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  splitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 16,
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 16,
    color: '#2A2D43',
    fontWeight: '500',
  },
  splitAmount: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  splitStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
  },
  splitStatusPaid: {
    backgroundColor: '#C8E6C9',
  },
  splitStatusText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  splitStatusTextPaid: {
    color: '#388E3C',
  },
});