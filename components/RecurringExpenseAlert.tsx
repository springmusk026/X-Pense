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
import { format } from 'date-fns';

interface RecurringExpenseAlertProps {
  description: string;
  amount: number;
  dueDate: string;
  onDismiss: () => void;
  onPay?: () => void;
}

export default function RecurringExpenseAlert({
  description,
  amount,
  dueDate,
  onDismiss,
  onPay,
}: RecurringExpenseAlertProps) {
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
            name="calendar-clock"
            size={24}
            color="#4A90E2"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Upcoming Payment</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.details}>
            ${amount.toFixed(2)} due on {format(new Date(dueDate), 'PP')}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <MaterialCommunityIcons name="close" size={20} color="#757575" />
        </TouchableOpacity>
      </View>

      {onPay && (
        <TouchableOpacity style={styles.payButton} onPress={onPay}>
          <MaterialCommunityIcons name="cash-fast" size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: '#F0F7FF',
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
  description: {
    fontSize: 14,
    color: '#2A2D43',
  },
  details: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});