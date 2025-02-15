import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '@/database/types';

const getShadowStyle = (): ViewStyle => {
  if (Platform.OS === 'ios') return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  };
  if (Platform.OS === 'android') return {
    elevation: 4,
  };
  return {
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    dateFilter: 'all' | 'today' | 'week' | 'month' | 'custom';
    categories: string[];
    minAmount: string;
    maxAmount: string;
    sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
  };
  onFiltersChange: (filters: FilterModalProps['filters']) => void;
  categories: Category[];
}

export function FilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
  categories,
}: FilterModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color="#757575"
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity 
              onPress={() => onFiltersChange({
                dateFilter: 'all',
                categories: [],
                minAmount: '',
                maxAmount: '',
                sortBy: 'date-desc',
              })}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateOptions}>
                {(['all', 'today', 'week', 'month'] as const).map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dateOption,
                        filters.dateFilter === option && styles.dateOptionActive,
                      ]}
                      onPress={() =>
                        onFiltersChange({ ...filters, dateFilter: option })
                      }
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          filters.dateFilter === option &&
                            styles.dateOptionTextActive,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.categoryOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryOption,
                      filters.categories.includes(category.name) &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() => {
                      const newCategories = filters.categories.includes(
                        category.name
                      )
                        ? filters.categories.filter((c) => c !== category.name)
                        : [...filters.categories, category.name];
                      onFiltersChange({ ...filters, categories: newCategories });
                    }}
                  >
                    <MaterialCommunityIcons
                      name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={
                        filters.categories.includes(category.name)
                          ? '#FFFFFF'
                          : category.color
                      }
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        filters.categories.includes(category.name) &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Amount Range</Text>
              <View style={styles.amountInputs}>
                <View style={styles.amountInput}>
                  <Text style={styles.amountInputLabel}>Min</Text>
                  <TextInput
                    style={styles.amountInputField}
                    value={filters.minAmount}
                    onChangeText={(text) =>
                      onFiltersChange({ ...filters, minAmount: text })
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.amountInputDivider} />
                <View style={styles.amountInput}>
                  <Text style={styles.amountInputLabel}>Max</Text>
                  <TextInput
                    style={styles.amountInputField}
                    value={filters.maxAmount}
                    onChangeText={(text) =>
                      onFiltersChange({ ...filters, maxAmount: text })
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { value: 'date-desc', label: 'Newest First' },
                  { value: 'date-asc', label: 'Oldest First' },
                  { value: 'amount-desc', label: 'Highest Amount' },
                  { value: 'amount-asc', label: 'Lowest Amount' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option.value && [
                        styles.sortOptionActive,
                        getShadowStyle(),
                      ],
                    ]}
                    onPress={() =>
                      onFiltersChange({
                        ...filters,
                        sortBy: option.value as typeof filters.sortBy,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        filters.sortBy === option.value &&
                          styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2D43',
  },
  resetText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2D43',
    marginBottom: 12,
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  dateOption: {
    flex: 1,
    minWidth: '25%',
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  dateOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dateOptionText: {
    fontSize: 14,
    color: '#2A2D43',
  },
  dateOptionTextActive: {
    color: '#FFFFFF',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2A2D43',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
  },
  amountInputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  amountInputField: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  amountInputDivider: {
    width: 20,
  },
  sortOptions: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sortOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#757575',
  },
  sortOptionTextActive: {
    color: '#2A2D43',
    fontWeight: '500',
  },
  applyButton: {
    margin: 20,
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
