import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch } from '../../../store';
import { addCard } from '../../../store/slices/cardsSlice';

const ISSUERS = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Other'];
const CARD_TYPES = ['credit', 'debit'];
const CARD_COLORS = [
  { name: 'Blue', value: '#4A90E2' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Red', value: '#F44336' },
];

const CardSchema = Yup.object().shape({
  nickname: Yup.string().required('Nickname is required'),
  last_four: Yup.string()
    .required('Last 4 digits are required')
    .matches(/^\d{4}$/, 'Must be exactly 4 digits'),
  issuer: Yup.string().required('Card issuer is required'),
  type: Yup.string().required('Card type is required'),
  expiry: Yup.string()
    .required('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Must be in MM/YY format'),
  color: Yup.string().required('Card color is required'),
});

export default function NewCardScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: any) => {
    try {
      const [month, year] = values.expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      
      await dispatch(addCard({
        ...values,
        expiry: expiryDate.toISOString(),
      })).unwrap();
      
      router.back();
    } catch (error) {
      console.error('Failed to add card:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      <Formik
        initialValues={{
          nickname: '',
          last_four: '',
          issuer: '',
          type: '',
          expiry: '',
          color: '',
        }}
        validationSchema={CardSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Personal Visa"
                value={values.nickname}
                onChangeText={handleChange('nickname')}
              />
              {touched.nickname && errors.nickname && (
                <Text style={styles.errorText}>{errors.nickname}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last 4 Digits</Text>
              <TextInput
                style={styles.input}
                placeholder="1234"
                value={values.last_four}
                onChangeText={handleChange('last_four')}
                keyboardType="numeric"
                maxLength={4}
              />
              {touched.last_four && errors.last_four && (
                <Text style={styles.errorText}>{errors.last_four}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Issuer</Text>
              <View style={styles.optionsGrid}>
                {ISSUERS.map((issuer) => (
                  <TouchableOpacity
                    key={issuer}
                    style={[
                      styles.optionItem,
                      values.issuer === issuer && styles.selectedOption,
                    ]}
                    onPress={() => setFieldValue('issuer', issuer)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        values.issuer === issuer && styles.selectedOptionText,
                      ]}
                    >
                      {issuer}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {touched.issuer && errors.issuer && (
                <Text style={styles.errorText}>{errors.issuer}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Type</Text>
              <View style={styles.optionsRow}>
                {CARD_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionItem,
                      { flex: 1, marginHorizontal: 8 },
                      values.type === type && styles.selectedOption,
                    ]}
                    onPress={() => setFieldValue('type', type)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        values.type === type && styles.selectedOptionText,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {touched.type && errors.type && (
                <Text style={styles.errorText}>{errors.type}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={values.expiry}
                onChangeText={handleChange('expiry')}
                maxLength={5}
              />
              {touched.expiry && errors.expiry && (
                <Text style={styles.errorText}>{errors.expiry}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Color</Text>
              <View style={styles.colorGrid}>
                {CARD_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color.value },
                      values.color === color.value && styles.selectedColor,
                    ]}
                    onPress={() => setFieldValue('color', color.value)}
                  >
                    {values.color === color.value && (
                      <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {touched.color && errors.color && (
                <Text style={styles.errorText}>{errors.color}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
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
  form: {
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  optionsRow: {
    flexDirection: 'row',
    margin: -8,
  },
  optionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: '#2A2D43',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});