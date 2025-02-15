import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { updateCategoryBudget } from '../store/slices/categoriesSlice';

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  category: {
    id: number;
    name: string;
    budget: number;
    color: string;
    icon: string;
  } | null;
}

export default function BudgetModal({ visible, onClose, category }: BudgetModalProps) {
  const dispatch = useDispatch();
  const [budget, setBudget] = useState(category?.budget?.toString() || '');

  const handleSave = async () => {
    if (category && budget) {
      try {
        await dispatch(updateCategoryBudget({
          id: category.id,
          budget: parseFloat(budget),
        })).unwrap();
        onClose();
      } catch (error) {
        console.error('Failed to update budget:', error);
      }
    }
  };

  if (!category) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Budget</Text>
          </View>

          <View style={styles.categoryInfo}>
            <MaterialCommunityIcons
              name={category.icon}
              size={32}
              color={category.color}
            />
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monthly Budget</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#757575"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Budget</Text>
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
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2D43',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2A2D43',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    fontSize: 24,
    color: '#2A2D43',
    padding: 0,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});