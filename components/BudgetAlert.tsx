import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BudgetAlertProps {
  category: string;
  spent: number;
  budget: number;
  onDismiss: () => void;
}

export default function BudgetAlert({ category, spent, budget, onDismiss }: BudgetAlertProps) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(5000),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, []);

  const percentage = (spent / budget) * 100;
  const isOverBudget = spent > budget;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={isOverBudget ? 'alert-circle' : 'alert'}
            size={24}
            color={isOverBudget ? '#FF6B6B' : '#FFA726'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOverBudget ? 'Budget Exceeded' : 'Budget Alert'}
          </Text>
          <Text style={styles.message}>
            {isOverBudget
              ? `You've exceeded your ${category} budget by $${(spent - budget).toFixed(2)}`
              : `You've used ${percentage.toFixed(0)}% of your ${category} budget`}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <MaterialCommunityIcons name="close" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOverBudget ? '#FF6B6B' : '#FFA726',
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#757575',
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});