import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClear: () => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartPicker(false);
    if (date) {
      onStartDateChange(date);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndPicker(false);
    if (date) {
      onEndDateChange(date);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color="#4A90E2" />
          <Text style={styles.dateText}>
            {startDate ? format(startDate, 'MMM d, yyyy') : 'Start Date'}
          </Text>
        </TouchableOpacity>

        <View style={styles.separator}>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#9CA3AF" />
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color="#4A90E2" />
          <Text style={styles.dateText}>
            {endDate ? format(endDate, 'MMM d, yyyy') : 'End Date'}
          </Text>
        </TouchableOpacity>

        {(startDate || endDate) && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <MaterialCommunityIcons name="close" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={endDate || new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
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
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  separator: {
    paddingHorizontal: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
});
