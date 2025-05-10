import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  ViewStyle,
  Animated,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Category, Expense } from '@/database/types';
import DateRangeFilter from '@/components/DateRangeFilter';

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  
  const loadMoreExpenses = useCallback(() => {
    setLoading(true);
    const filteredExpenses = expenses.filter(expense => 
      (expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.amount.toString().includes(searchQuery)) &&
      (!startDate || new Date(expense.date) >= startDate) &&
      (!endDate || new Date(expense.date) <= endDate)
    );
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    setDisplayedExpenses(filteredExpenses.slice(startIndex, endIndex));
    setLoading(false);
  }, [expenses, page, itemsPerPage, searchQuery, startDate, endDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadMoreExpenses();
    setRefreshing(false);
  }, [loadMoreExpenses]);

  // Effect to trigger search when query changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setPage(1);
      loadMoreExpenses();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, loadMoreExpenses]);

  useEffect(() => {
    setPage(1);
    loadMoreExpenses();
  }, [expenses, startDate, endDate]);

  useEffect(() => {
    loadMoreExpenses();
  }, [page]);

  const hasMoreExpenses = expenses.length > page * itemsPerPage;

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const EmptyStateContent = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="wallet-outline"
        size={80}
        color="#9CA3AF"
      />
      <Text style={styles.emptyStateTitle}>No expenses found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try adjusting your search or filters
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

  const ListFooterComponent = () => (
    <>
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
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TouchableOpacity 
            onPress={loadMoreExpenses}
            style={styles.searchIcon}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#757575"
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(1);
            }}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setPage(1);
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={() => {
          setStartDate(null);
          setEndDate(null);
          setPage(1);
        }}
      />
      <FlatList
        data={displayedExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.expensesListContent,
          displayedExpenses.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <ExpenseItem
            expense={item}
            category={categoryMap[item.category]}
            isLastItem={index === displayedExpenses.length - 1 && !hasMoreExpenses}
          />
        )}
        ListEmptyComponent={EmptyStateContent}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
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
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2A2D43',
  },
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
  emptyListContent: {
    flex: 1,
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
