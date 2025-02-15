import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from 'victory-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { RootState } from '../../../store';
import { exportExpensesToCSV } from '../../../utils/export';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

type TimeRange = 'week' | 'month' | 'year';
type ChartType = 'spending' | 'category';

export default function ReportsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<ChartType>('spending');
  const [isExporting, setIsExporting] = useState(false);
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const categories = useSelector((state: RootState) => state.categories.items);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportExpensesToCSV(expenses);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryData = () => {
    const categoryTotals = categories.map(category => {
      const total = expenses
        .filter(expense => expense.category === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        x: category.name,
        y: total,
        color: category.color,
      };
    }).filter(item => item.y > 0);

    return categoryTotals;
  };

  const getSpendingData = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayTotal = expenses
        .filter(expense => isSameMonth(new Date(expense.date), day))
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        x: format(day, 'd'),
        y: dayTotal,
      };
    });
  };

  const getTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAverageSpending = () => {
    if (expenses.length === 0) return 0;
    return getTotalSpent() / expenses.length;
  };

  const getMostSpentCategory = () => {
    const categoryTotals = getCategoryData();
    if (categoryTotals.length === 0) return null;
    return categoryTotals.reduce((max, current) => 
      current.y > max.y ? current : max
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <MaterialCommunityIcons name="file-export" size={24} color="#4A90E2" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#4A90E2" />
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            ${getTotalSpent().toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#4CAF50" />
          <Text style={styles.summaryLabel}>Average per Transaction</Text>
          <Text style={styles.summaryValue}>
            ${getAverageSpending().toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Spending Analysis</Text>
          <View style={styles.chartControls}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentedButton,
                  chartType === 'spending' && styles.segmentedButtonActive,
                ]}
                onPress={() => setChartType('spending')}
              >
                <Text
                  style={[
                    styles.segmentedButtonText,
                    chartType === 'spending' && styles.segmentedButtonTextActive,
                  ]}
                >
                  Timeline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentedButton,
                  chartType === 'category' && styles.segmentedButtonActive,
                ]}
                onPress={() => setChartType('category')}
              >
                <Text
                  style={[
                    styles.segmentedButtonText,
                    chartType === 'category' && styles.segmentedButtonTextActive,
                  ]}
                >
                  Categories
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          {chartType === 'category' ? (
            <VictoryPie
              data={getCategoryData()}
              width={CHART_WIDTH}
              height={300}
              colorScale={getCategoryData().map(d => d.color)}
              innerRadius={70}
              labelRadius={({ innerRadius }) => (innerRadius + 80) as number}
              style={{
                labels: {
                  fill: '#2A2D43',
                  fontSize: 12,
                },
              }}
              labels={({ datum }) => `${datum.x}\n$${datum.y.toFixed(0) || 0}`}
            />
          ) : (
            <VictoryChart
              width={CHART_WIDTH}
              height={300}
              theme={VictoryTheme.material}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                tickFormat={(t) => t}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `$${t}`}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 },
                }}
              />
              <VictoryBar
                data={getSpendingData()}
                style={{
                  data: {
                    fill: '#4A90E2',
                  },
                }}
                animate={{
                  duration: 500,
                }}
              />
            </VictoryChart>
          )}
        </View>
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Key Insights</Text>
        
        <View style={styles.insightCard}>
          <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Most Spent Category</Text>
            <Text style={styles.insightValue}>
              {getMostSpentCategory()?.x || 'No data'}
              {getMostSpentCategory() && ` ($${getMostSpentCategory()?.y.toFixed(2)})`}
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <MaterialCommunityIcons name="calendar-month" size={24} color="#FF9800" />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>This Month's Total</Text>
            <Text style={styles.insightValue}>
              ${getTotalSpent().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2A2D43',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCards: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 16,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  segmentedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  segmentedButtonActive: {
    backgroundColor: '#FFFFFF',
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
  segmentedButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentedButtonTextActive: {
    color: '#2A2D43',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  insightsContainer: {
    padding: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  insightContent: {
    marginLeft: 16,
  },
  insightLabel: {
    fontSize: 14,
    color: '#757575',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginTop: 4,
  },
});