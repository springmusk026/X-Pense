import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../../../store';
import { fetchCards } from '../../../store/slices/cardsSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const CARD_HEIGHT = 200;

const ISSUER_CONFIGS = {
  'Visa': {
    colors: ['#436D99', '#1A1F71'],
    icon: 'credit-card',
    pattern: 'linear'
  },
  'Mastercard': {
    colors: ['#EB001B', '#F79E1B'],
    icon: 'credit-card-outline',
    pattern: 'radial'
  },
  'American Express': {
    colors: ['#2E77BB', '#1B1F71'],
    icon: 'credit-card-multiple',
    pattern: 'diagonal'
  },
  'Discover': {
    colors: ['#FF6000', '#D14700'],
    icon: 'credit-card-check',
    pattern: 'wave'
  },
  'Other': {
    colors: ['#757575', '#424242'],
    icon: 'credit-card-settings',
    pattern: 'solid'
  },
} as const;

export default function CardsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const cards = useSelector((state: RootState) => state.cards.items);
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const [activeCard, setActiveCard] = useState(0);
  const scrollX = new Animated.Value(0);

  useEffect(() => {
    dispatch(fetchCards());
  }, [dispatch]);

  const getCardSpending = (cardId: number) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.card_id === cardId && 
               expenseDate.getMonth() === currentMonth &&
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCardTotalSpending = (cardId: number) => {
    return expenses
      .filter(expense => expense.card_id === cardId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const renderCardPattern = (pattern: string) => {
    switch (pattern) {
      case 'linear':
        return (
          <View style={{ position: 'absolute', opacity: 0.1 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: CARD_WIDTH,
                  height: 1,
                  backgroundColor: '#FFFFFF',
                  marginVertical: 30,
                }}
              />
            ))}
          </View>
        );
      case 'radial':
        return (
          <View style={{ position: 'absolute', opacity: 0.1 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: CARD_WIDTH * (1 - i * 0.2),
                  height: CARD_WIDTH * (1 - i * 0.2),
                  borderRadius: CARD_WIDTH,
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                  position: 'absolute',
                  top: -CARD_WIDTH * 0.3,
                  right: -CARD_WIDTH * 0.3,
                }}
              />
            ))}
          </View>
        );
      case 'diagonal':
        return (
          <View style={{ position: 'absolute', opacity: 0.1 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: CARD_WIDTH * 2,
                  height: 1,
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: i * 40,
                  left: -CARD_WIDTH / 2,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            ))}
          </View>
        );
      case 'wave':
        return (
          <View style={{ position: 'absolute', opacity: 0.1, flexDirection: 'row' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: CARD_WIDTH / 3,
                  height: CARD_HEIGHT,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                  marginHorizontal: -20,
                }}
              />
            ))}
          </View>
        );
      case 'solid':
      default:
        return null;
    }
  };

  const renderCards = () => {
    return (
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { 
            useNativeDriver: true,
            listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 20));
              setActiveCard(newIndex);
            }
          }
        )}
        scrollEventThrottle={16}
      >
        {cards.map((card, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + 20),
            index * (CARD_WIDTH + 20),
            (index + 1) * (CARD_WIDTH + 20),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={card.id}
              style={[
                styles.cardWrapper,
                { transform: [{ scale }], opacity }
              ]}
            >
              <Pressable 
                key={`card-pressable-${card.id}`}
                onPress={() => {/* Navigate to card details */}}
              >
                <LinearGradient
                  colors={ISSUER_CONFIGS[card.issuer as keyof typeof ISSUER_CONFIGS]?.colors || ISSUER_CONFIGS.Other.colors}
                  style={styles.card}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {renderCardPattern(ISSUER_CONFIGS[card.issuer as keyof typeof ISSUER_CONFIGS]?.pattern || 'solid')}
                  
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardNickname}>{card.nickname}</Text>
                    <MaterialCommunityIcons
                      name={ISSUER_CONFIGS[card.issuer as keyof typeof ISSUER_CONFIGS]?.icon || 'credit-card'}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.cardNumber}>
                    <Text style={styles.cardDots}>•••• •••• •••• </Text>
                    <Text style={styles.lastFour}>{card.last_four}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View key={`expiry-${card.id}`}>
                      <Text style={styles.cardLabel}>Expires</Text>
                      <Text style={styles.cardValue}>{format(new Date(card.expiry), 'MM/yy')}</Text>
                    </View>
                    <View key={`type-${card.id}`}>
                      <Text style={styles.cardLabel}>Card Type</Text>
                      <Text style={styles.cardValue}>{card.type}</Text>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.cardStats}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem} key={`monthly-${card.id}`}>
                      <Text style={styles.statLabel}>This Month</Text>
                      <Text style={styles.statValue}>
                        ${getCardSpending(card.id).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.statItem} key={`total-${card.id}`}>
                      <Text style={styles.statLabel}>Total Spent</Text>
                      <Text style={styles.statValue}>
                        ${getCardTotalSpending(card.id).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.viewTransactionsButton}>
                    <Text style={styles.viewTransactionsText}>View Transactions</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      
      {cards.length > 0 ? (
        <>
          {renderCards()}
          <View style={styles.pagination}>
            {cards.map((card, index) => (
              <View
                key={`pagination-${card.id}`}
                style={[
                  styles.paginationDot,
                  index === activeCard && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="credit-card-plus-outline" 
            size={80} 
            color="#9CA3AF" 
          />
          <Text style={styles.emptyStateTitle}>No cards yet</Text>
          <Text style={styles.emptyStateText}>
            Add your first card to start tracking expenses
          </Text>
          <Link href="/cards/new" asChild>
            <TouchableOpacity style={styles.emptyStateButton}>
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Add Your First Card</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 20,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  cardNickname: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardDots: {
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 4,
    opacity: 0.9,
  },
  lastFour: {
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  viewTransactionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginRight: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4A90E2',
    width: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
