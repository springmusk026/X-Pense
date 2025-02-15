import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ViewStyle,
  Animated,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Category, Expense } from '@/database/types';

// Platform-specific shadow styles with enhanced depth
const platformStyles = {
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
} as const;

const getShadowStyle = (): ViewStyle => {
  if (Platform.OS === 'ios') return platformStyles.ios;
  if (Platform.OS === 'android') return platformStyles.android;
  return platformStyles.web as ViewStyle;
};

interface ExpensesListProps {
  expenses: Expense[];
  categories: Category[];
  onClearFilters?: () => void;
  showClearFilters?: boolean;
  itemsPerPage?: number;
}

const ExpenseItem = React.memo(({
  expense,
  category,
  isLastItem
}: { 
  expense: Expense;
  category?: Category;
  isLastItem: boolean;
}) => {
  // Calculate if the expense is from today
  const isToday = format(new Date(expense.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const [scaleAnim] = useState(new Animated.Value(1));

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Link href={`/(tabs)/expenses/${expense.id}`} asChild>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.expenseItemBase,
          getShadowStyle(),
          !isLastItem && styles.expenseItemMargin
        ]}
      >
        <Animated.View style={[
          styles.expenseItemInner,
          { transform: [{ scale: scaleAnim }] }
        ]}>
        <View style={[styles.expenseIcon, {
          backgroundColor: category?.color + '10',
          borderWidth: 1,
          borderColor: category?.color + '20'
        }]}>
          <MaterialCommunityIcons
            name={(category?.icon || 'cash') as any}
            size={24}
            color={category?.color}
          />
        </View>
        <View style={styles.expenseDetails}>
          <View style={styles.expenseHeaderRow}>
            <Text style={styles.expenseCategory}>{expense.category}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
          <Text style={styles.expenseDescription} numberOfLines={2}>
            {expense.description}
          </Text>
          <Text style={styles.expenseDate}>
            {format(new Date(expense.date), 'EEE, MMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[
            styles.expenseAmount,
            { color: expense.amount > 1000 ? '#FF6B6B' : '#2A2D43' }
          ]}>
            ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );
});

export default function ExpensesList({ 
  expenses, 
  categories,
  onClearFilters,
  showClearFilters = false,
  itemsPerPage = 15,
}: ExpensesListProps) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  
  const loadMoreExpenses = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const startIndex = 0;
      const endIndex = page * itemsPerPage;
      setDisplayedExpenses(expenses.slice(startIndex, endIndex));
      setLoading(false);
    }, 500); // Simulate network delay
  }, [expenses, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
    loadMoreExpenses();
  }, [expenses]);

  useEffect(() => {
    loadMoreExpenses();
  }, [page]);

  const hasMoreExpenses = expenses.length > page * itemsPerPage;

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  // Memoize category lookup for better performance
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  if (displayedExpenses.length === 0 && !loading) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="wallet-outline"
          size={80}
          color="#9CA3AF"
        />
        <Text style={styles.emptyStateTitle}>No expenses found</Text>
        <Text style={styles.emptyStateSubtitle}>
          Try adjusting your filters or add a new expense
        </Text>
        {showClearFilters && onClearFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={onClearFilters}
          >
            <MaterialCommunityIcons name="filter-off" size={20} color="#FFFFFF" />
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.expensesList}
        contentContainerStyle={styles.expensesListContent}
        showsVerticalScrollIndicator={false}
      >
        {displayedExpenses.map((expense, index) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            category={categoryMap[expense.category]}
            isLastItem={index === displayedExpenses.length - 1 && !hasMoreExpenses}
          />
        ))}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons 
              name="loading" 
              size={24} 
              color="#4A90E2"
              style={styles.loadingIcon} 
            />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        )}

        {hasMoreExpenses && !loading && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#4A90E2"
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  expensesList: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  expensesListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  expenseItemBase: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  expenseItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  expenseItemMargin: {
    marginBottom: 16,
  },
  expenseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 16,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.4,
  },
  expenseDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  expenseDate: {
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: -0.1,
  },
  amountContainer: {
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
    backgroundColor: '#F8FAFC',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(74,144,226,0.3)',
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  clearFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  todayBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingIcon: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 4,
  },
});
