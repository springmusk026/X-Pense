import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { RootState, AppDispatch } from '../../../store';
import { fetchExpenses } from '../../../store/slices/expensesSlice';
import FilterHeader from './components/FilterHeader';
import ExpensesList from './components/ExpensesList';
import FilterModal from './components/FilterModal';

type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortByType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface FilterState {
  search: string;
  categories: string[];
  dateFilter: DateFilterType;
  customStartDate: Date | null;
  customEndDate: Date | null;
  minAmount: string;
  maxAmount: string;
  sortBy: SortByType;
}

export default function ExpensesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    dateFilter: 'all',
    customStartDate: null,
    customEndDate: null,
    minAmount: '',
    maxAmount: '',
    sortBy: 'date-desc',
  });

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const getDateRange = (filter: DateFilterType): { start: Date; end: Date } | null => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case 'week':
        return {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now),
        };
      case 'month':
        return {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now),
        };
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          return {
            start: startOfDay(filters.customStartDate),
            end: endOfDay(filters.customEndDate),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        expense.description.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower) ||
        expense.amount.toString().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(expense.category)) return false;
    }

    // Date filter
    const dateRange = getDateRange(filters.dateFilter);
    if (dateRange) {
      if (!isWithinInterval(new Date(expense.date), dateRange)) return false;
    }

    // Amount filter
    const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
    const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
    if (minAmount !== null && expense.amount < minAmount) return false;
    if (maxAmount !== null && expense.amount > maxAmount) return false;

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.dateFilter !== 'all') count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.sortBy !== 'date-desc') count++;
    return count;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      dateFilter: 'all',
      customStartDate: null,
      customEndDate: null,
      minAmount: '',
      maxAmount: '',
      sortBy: 'date-desc',
    });
  };

  return (
    <View style={styles.container}>
      <FilterHeader
        search={filters.search}
        onSearchChange={(text) => setFilters({ ...filters, search: text })}
        onFilterPress={() => setShowFilters(true)}
        activeFilterCount={getActiveFilterCount()}
      />

      <ExpensesList
        expenses={filteredExpenses as any}
        categories={categories}
        onClearFilters={clearFilters}
        showClearFilters={getActiveFilterCount() > 0}
      />

      <Link href="/(tabs)/expenses/new" asChild>
        <TouchableOpacity 
          style={[styles.fab, {
            position: 'absolute',
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#4A90E2',
            alignItems: 'center',
            justifyContent: 'center',
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
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
              },
            }),
          }]}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Link>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{
          dateFilter: filters.dateFilter,
          categories: filters.categories,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          sortBy: filters.sortBy,
        }}
        onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
        categories={categories}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  },
});
