import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RootState, AppDispatch } from '../../../../store';
import { addRecurringExpense } from '../../../../store/slices/recurringExpensesSlice';
import DatePicker from '../../../../components/DatePicker';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const RecurringExpenseSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  frequency: Yup.string()
    .oneOf(['daily', 'weekly', 'monthly', 'yearly'])
    .required('Frequency is required'),
  interval: Yup.number()
    .required('Interval is required')
    .positive('Interval must be positive')
    .integer('Interval must be a whole number'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().nullable().min(Yup.ref('start_date'), 'End date must be after start date'),
});

export default function NewRecurringExpenseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.items);

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(addRecurringExpense(values)).unwrap();
      router.back();
    } catch (error) {
      console.error('Failed to add recurring expense:', error);
    }
  };

  return (
    <View style={styles.container}>
      
      <Formik
        initialValues={{
          amount: '',
          category: '',
          description: '',
          frequency: 'monthly',
          interval: '1',
          start_date: new Date(),
          end_date: null,
        }}
        validationSchema={RecurringExpenseSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <ScrollView style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={values.amount}
                  onChangeText={handleChange('amount')}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryItem,
                      values.category === category.name && styles.selectedCategory,
                    ]}
                    onPress={() => setFieldValue('category', category.name)}
                  >
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={24}
                      color={
                        values.category === category.name
                          ? '#FFFFFF'
                          : category.color
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        values.category === category.name &&
                          styles.selectedCategoryText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {touched.category && errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={values.description}
                onChangeText={handleChange('description')}
                placeholder="e.g., Monthly Rent"
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyOptions}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    style={[
                      styles.frequencyItem,
                      values.frequency === freq.value &&
                        styles.selectedFrequency,
                    ]}
                    onPress={() => setFieldValue('frequency', freq.value)}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        values.frequency === freq.value &&
                          styles.selectedFrequencyText,
                      ]}
                    >
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repeat Every</Text>
              <View style={styles.intervalInput}>
                <TextInput
                  style={styles.intervalNumber}
                  value={values.interval}
                  onChangeText={handleChange('interval')}
                  keyboardType="number-pad"
                />
                <Text style={styles.intervalText}>
                  {values.frequency}
                  {values.interval !== '1' ? 's' : ''}
                </Text>
              </View>
              {touched.interval && errors.interval && (
                <Text style={styles.errorText}>{errors.interval}</Text>
              )}
            </View>

            <DatePicker
              label="Start Date"
              value={values.start_date}
              onChange={(date) => setFieldValue('start_date', date)}
            />

            <View style={styles.inputGroup}>
              <View style={styles.endDateHeader}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFieldValue(
                      'end_date',
                      values.end_date ? null : new Date()
                    )
                  }
                >
                  <Text style={styles.endDateToggle}>
                    {values.end_date ? 'Remove' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
              {values.end_date && (
                <DatePicker
                  value={values.end_date}
                  onChange={(date) => setFieldValue('end_date', date)}
                  minimumDate={values.start_date}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitButtonText}>Create Recurring Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Formik>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2D43',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2A2D43',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#2A2D43',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2A2D43',
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  categoryItem: {
    width: '29%',
    margin: '2%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#2A2D43',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  frequencyOptions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
  },
  frequencyItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedFrequency: {
    backgroundColor: '#4A90E2',
  },
  frequencyText: {
    fontSize: 14,
    color: '#2A2D43',
  },
  selectedFrequencyText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  intervalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  intervalNumber: {
    width: 60,
    fontSize: 16,
    textAlign: 'center',
    color: '#2A2D43',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 12,
    paddingRight: 12,
  },
  intervalText: {
    fontSize: 16,
    color: '#757575',
  },
  endDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  endDateToggle: {
    fontSize: 14,
    color: '#4A90E2',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});