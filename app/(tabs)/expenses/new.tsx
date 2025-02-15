import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { RootState, AppDispatch } from '../../../store';
import { addExpense } from '../../../store/slices/expensesSlice';
import ReceiptScanner from '../../../components/ReceiptScanner';

const ExpenseSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  date: Yup.date().required('Date is required'),
  receipt_uri: Yup.string(),
});

export default function NewExpenseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.items);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imagePickerPermission, requestImagePickerPermission] = ImagePicker.useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);

  interface ScanItem {
    description: string;
    amount: number;
  }

  interface ScanData {
    amount?: number;
    date?: string;
    items?: ScanItem[];
  }

  const handleScanComplete = (formikProps: any) => (scanData: ScanData) => {
    if (scanData.amount) {
      formikProps.setFieldValue('amount', scanData.amount.toFixed(2));
    }
    if (scanData.date) {
      formikProps.setFieldValue('date', new Date(scanData.date).toISOString());
    }
    if (scanData.items && scanData.items.length > 0) {
      const description = scanData.items
        .map(item => `${item.description} ($${item.amount})`)
        .join(', ');
      formikProps.setFieldValue('description', description);
    }
    setShowScanner(false);
  };

  const pickImage = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      if (Platform.OS !== 'web') {
        if (!imagePickerPermission?.granted) {
          const permission = await requestImagePickerPermission();
          if (!permission.granted) {
            return;
          }
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFieldValue('receipt_uri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFieldValue('receipt_uri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount)
      };
      await dispatch(addExpense(expenseData)).unwrap();
      router.back();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      <Formik
        initialValues={{
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString(),
          receipt_uri: '',
        }}
        validationSchema={ExpenseSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={values.amount}
                onChangeText={handleChange('amount')}
              />
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      values.category === category.name && styles.selectedCategory,
                    ]}
                    onPress={() => setFieldValue('category', category.name)}
                  >
                    <MaterialCommunityIcons
                      name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={values.category === category.name ? '#FFFFFF' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        values.category === category.name && styles.selectedCategoryText,
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
                placeholder="What did you spend on?"
                value={values.description}
                onChangeText={handleChange('description')}
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Receipt</Text>
              <View style={styles.receiptActions}>
                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() => setShowScanner(true)}
                >
                  <MaterialCommunityIcons name="text-recognition" size={24} color="#4A90E2" />
                  <Text style={styles.receiptButtonText}>Scan Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() => takePhoto(setFieldValue)}
                >
                  <MaterialCommunityIcons name="camera" size={24} color="#4A90E2" />
                  <Text style={styles.receiptButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() => pickImage(setFieldValue)}
                >
                  <MaterialCommunityIcons name="image" size={24} color="#4A90E2" />
                  <Text style={styles.receiptButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>

              {values.receipt_uri ? (
                <View style={styles.receiptPreview}>
                  <Image
                    source={{ uri: values.receipt_uri }}
                    style={styles.receiptImage}
                  />
                  <TouchableOpacity
                    style={styles.removeReceiptButton}
                    onPress={() => setFieldValue('receipt_uri', '')}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitButtonText}>Add Expense</Text>
            </TouchableOpacity>

            <Modal
              visible={showScanner}
              animationType="slide"
              onRequestClose={() => setShowScanner(false)}
            >
              <ReceiptScanner
                onScanComplete={handleScanComplete({ setFieldValue })}
                onClose={() => setShowScanner(false)}
              />
            </Modal>
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2D43',
    letterSpacing: -0.5,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2A2D43',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryItem: {
    width: '30%',
    margin: '1.66%',
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  receiptButtonText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  receiptPreview: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeReceiptButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
