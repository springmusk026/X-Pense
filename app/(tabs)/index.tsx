import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { VictoryPie } from 'victory-native';
import { Link } from 'expo-router';
import { RootState, AppDispatch } from '../../store';
import { fetchExpenses } from '../../store/slices/expensesSlice';
import { fetchCategories, updateCategoryBudget } from '../../store/slices/categoriesSlice';
import BudgetModal from '../../components/BudgetModal';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const progressAnimation = useState(new Animated.Value(0))[0];
  const monthlyAnimation = useRef(new Animated.Value(0)).current;
  const [categorySpending, setCategorySpending] = useState<{ category: string; amount: number; color: string }[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (expenses.length && categories.length) {
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      setTotalSpent(total);

      const spending = categories.map(cat => ({
        category: cat.name,
        amount: expenses
          .filter(exp => exp.category === cat.name)
          .reduce((sum, exp) => sum + exp.amount, 0),
        color: cat.color,
      })).filter(item => item.amount > 0);

      setCategorySpending(spending);

      // Calculate monthly spending
      const currentMonth = new Date().getMonth();
      const monthlyTotal = expenses
        .filter(exp => new Date(exp.date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0);
      setMonthlySpent(monthlyTotal);

      // Animate values
      Animated.parallel([
        Animated.timing(progressAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.spring(monthlyAnimation, {
          toValue: 1,
          tension: 30,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [expenses, categories, progressAnimation]);

  const chartData = categorySpending.map(item => ({
    x: item.category,
    y: item.amount,
    color: item.color,
  }));

  const getBudgetProgress = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category || !category.budget) return 0;

    const spent = expenses
      .filter(exp => exp.category === categoryName)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return Math.min((spent / category.budget) * 100, 100);
  };

  const getBudgetStatus = (progress: number) => {
    if (progress >= 100) return '#FF6B6B';
    if (progress >= 80) return '#FFA726';
    return '#4CAF50';
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello there! 👋</Text>
          <Text style={styles.dateText}>
            {format(new Date(), 'MMMM yyyy')}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Animated.View 
            style={[
              styles.statsCard,
              {
                transform: [{
                  scale: monthlyAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })
                }]
              }
            ]}
          >
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#FFB74D" />
              <Text style={styles.statsLabel}>This Month</Text>
            </View>
            <Text style={[styles.statsAmount, { color: '#FFB74D' }]}>
              ${monthlySpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.statsCard,
              {
                transform: [{
                  scale: monthlyAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })
                }]
              }
            ]}
          >
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#4DB6AC" />
              <Text style={styles.statsLabel}>Total</Text>
            </View>
            <Text style={[styles.statsAmount, { color: '#4DB6AC' }]}>
              ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.budgetSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="finance" size={24} color="#7C4DFF" />
              <Text style={styles.sectionTitle}>Budget Overview</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBudgetModal(true)}>
              <MaterialCommunityIcons name="pencil" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {categories.map(category => {
            const progress = getBudgetProgress(category.name);
            const statusColor = getBudgetStatus(progress);
            const spent = expenses
              .filter(exp => exp.category === category.name)
              .reduce((sum, exp) => sum + exp.amount, 0);

            return (
              <Pressable
                key={category.name}
                style={[styles.budgetItem, { backgroundColor: category.color + '08' }]}
                onPress={() => {
                  setSelectedCategory(category.name);
                  setShowBudgetModal(true);
                }}
              >
                <View style={styles.budgetHeader}>
                  <View style={styles.categoryInfo}>
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={24}
                      color={category.color}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <Text style={styles.budgetAmount}>
                    ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    {category.budget ? ` / $${category.budget}` : ''}
                  </Text>
                </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${progress}%`],
                    }),
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>

                {progress >= 80 && (
                  <View style={styles.warningContainer}>
                    <MaterialCommunityIcons
                      name={progress >= 100 ? 'alert-circle' : 'alert'}
                      size={16}
                      color={statusColor}
                    />
                    <Text style={[styles.warningText, { color: statusColor }]}>
                      {progress >= 100
                        ? 'Budget exceeded!'
                        : 'Approaching budget limit'}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {categorySpending.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="chart-pie" size={24} color="#FF7043" />
              <Text style={styles.sectionTitle}>Spending by Category</Text>
            </View>
            <View style={styles.chart}>
              <VictoryPie
                data={chartData}
                colorScale={chartData.map(d => d.color)}
                width={300}
                height={300}
                padding={50}
                labels={({ datum }) => `${datum.x}\n$${datum.y.toFixed(0) || 0}`}
                style={{
                  labels: {
                    fill: '#2A2D43',
                    fontSize: 12,
                  },
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.recentExpenses}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#42A5F5" />
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
            </View>
            <Link href="/(tabs)/expenses" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {expenses.slice(0, 3).map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseIcon}>
                <MaterialCommunityIcons
                  name={(categories.find(c => c.name === expense.category)?.icon || 'cash') as any}
                  size={24}
                  color={categories.find(c => c.name === expense.category)?.color}
                />
              </View>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
          <Link href="/(tabs)/expenses" asChild>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View More Expenses</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory ? categories.find(c => c.name === selectedCategory) || null : null}
      />
      <Link href="/(tabs)/expenses/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <View style={styles.fabInner}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A2D43',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 8,
  },
  statsAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 4,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D43',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15,
    color: '#757575',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  budgetSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 20,
    ...(Platform.select({
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
      },
    }) as any),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetItem: {
    marginBottom: 24,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2A2D43',
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#757575',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    marginLeft: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    margin: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chart: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginLeft: 12,
  },
  recentExpenses: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    margin: 16,
    marginBottom: 100,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 12,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2A2D43',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#757575',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24, // Account for iOS home indicator
    right: 24,
    zIndex: 999, // Ensure it stays on top
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 12px rgba(74,144,226,0.3)',
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
