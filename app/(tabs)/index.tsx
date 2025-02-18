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
import { VictoryPie, VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { exportExpensesToCSV } from '../../utils/export';
import { Link } from 'expo-router';
import { RootState, AppDispatch } from '../../store';
import { fetchExpenses } from '../../store/slices/expensesSlice';
import { fetchCategories, updateCategoryBudget } from '../../store/slices/categoriesSlice';
import BudgetModal from '../../components/BudgetModal';

export default function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [trendData, setTrendData] = useState<{ x: string; y: number }[]>([]);
  const [exporting, setExporting] = useState(false);
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

      const currentMonth = new Date().getMonth();
      const monthlyTotal = expenses
        .filter(exp => new Date(exp.date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0);
      setMonthlySpent(monthlyTotal);

      // Calculate spending trends for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: format(date, 'MMM'),
          fullDate: date,
        };
      }).reverse();

      const trends = last6Months.map(({ month, fullDate }) => {
        const monthlySpent = expenses
          .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === fullDate.getMonth() &&
              expDate.getFullYear() === fullDate.getFullYear();
          })
          .reduce((sum, exp) => sum + exp.amount, 0);
        return { x: month, y: monthlySpent };
      });

      setTrendData(trends);

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <View style={styles.charts}>
              <Text style={styles.chartTitle}>Monthly Distribution</Text>
              <VictoryPie
                data={chartData}
                colorScale={chartData.map(d => d.color)}
                width={300}
                height={250}
                padding={40}
                labels={({ datum }) => `${datum.x}\n$${datum.y.toFixed(0) || 0}`}
                style={{
                  labels: {
                    fill: '#2A2D43',
                    fontSize: 12,
                  },
                }}
              />
              <View style={styles.trendChart}>
                <Text style={styles.chartTitle}>Spending Trend</Text>
                <VictoryChart
                  theme={VictoryTheme.material}
                  height={250}
                  padding={{ top: 20, right: 40, bottom: 40, left: 60 }}
                >
                  <VictoryAxis
                    tickFormat={(t) => t}
                    style={{
                      tickLabels: { fontSize: 10, fill: '#6B7280' }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `$${t}`}
                    style={{
                      tickLabels: { fontSize: 10, fill: '#6B7280' }
                    }}
                  />
                  <VictoryLine
                    style={{
                      data: { stroke: "#4A90E2" },
                      parent: { border: "1px solid #ccc" }
                    }}
                    data={trendData}
                    animate={{
                      duration: 2000,
                      onLoad: { duration: 1000 }
                    }}
                  />
                </VictoryChart>
              </View>
            </View>
          </View>
        )}

        <View style={styles.recentExpenses}>
          <View style={styles.recentExpensesHeader}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#42A5F5" />
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={async () => {
                    setExporting(true);
                    try {
                      await exportExpensesToCSV(expenses);
                    } catch (error) {
                      console.error('Export failed:', error);
                    } finally {
                      setExporting(false);
                    }
                  }}
                  disabled={exporting}
                >
                  <MaterialCommunityIcons
                    name={exporting ? "loading" : "file-export-outline"}
                    size={20}
                    color="#4A90E2"
                    style={exporting && styles.spinningIcon}
                  />
                  <Text style={styles.exportText}>
                    {exporting ? 'Exporting...' : 'Export'}
                  </Text>
                </TouchableOpacity>
                <Link href="/(tabs)/expenses" asChild>
                  <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
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
  charts: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    margin: 8,
    borderRadius: 16,
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
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      },
    }),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 12,
    textAlign: 'center',
  },
  trendChart: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  recentExpensesHeader: {
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '500',
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D43',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
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
    fontSize: 18,
    fontWeight: '700',
  },
  budgetSection: {
    backgroundColor: '#FFFFFF',
    margin: 8,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
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
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginLeft: 8,
  },
  budgetItem: {
    marginBottom: 16,
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
    fontSize: 15,
    color: '#2A2D43',
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#757575',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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
    padding: 16,
    margin: 8,
    borderRadius: 16,
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
  recentExpenses: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 8,
    marginBottom: 80,
    borderRadius: 16,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 15,
    fontWeight: '500',
    color: '#2A2D43',
  },
  expenseDescription: {
    fontSize: 13,
    color: '#757575',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2A2D43',
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
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
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    right: 16,
    zIndex: 999,
  },
  fabInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(74,144,226,0.3)',
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
