import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addSplitExpense } from '../store/slices/splitExpensesSlice';

interface Participant {
  name: string;
  amount: string;
}

interface SplitExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expenseId: number;
  totalAmount: number;
}

export default function SplitExpenseModal({
  visible,
  onClose,
  expenseId,
  totalAmount,
}: SplitExpenseModalProps) {
  const dispatch = useDispatch();
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', amount: '' },
  ]);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', amount: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const splitEvenly = () => {
    const amount = (totalAmount / participants.length).toFixed(2);
    setParticipants(
      participants.map(p => ({ ...p, amount: amount.toString() }))
    );
  };

  const handleSave = async () => {
    try {
      const splits = participants
        .filter(p => p.name && p.amount)
        .map(p => ({
          expense_id: expenseId,
          participant_name: p.name,
          amount: parseFloat(p.amount),
          status: 'pending' as const,
        }));

      await dispatch(addSplitExpense(splits)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to split expense:', error);
    }
  };

  const totalSplit = participants.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

  const isValid =
    participants.every(p => p.name && p.amount) &&
    Math.abs(totalSplit - totalAmount) < 0.01;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
            <Text style={styles.title}>Split Expense</Text>
          </View>

          <View style={styles.totalAmount}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ${totalAmount.toFixed(2)}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            {participants.map((participant, index) => (
              <View key={index} style={styles.participantContainer}>
                <View style={styles.participantInputs}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Name"
                    value={participant.name}
                    onChangeText={(value) =>
                      updateParticipant(index, 'name', value)
                    }
                  />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={participant.amount}
                    onChangeText={(value) =>
                      updateParticipant(index, 'amount', value)
                    }
                  />
                </View>
                {participants.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeParticipant(index)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={24}
                      color="#FF6B6B"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={addParticipant}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={20}
                  color="#4A90E2"
                />
                <Text style={styles.actionButtonText}>Add Person</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={splitEvenly}
              >
                <MaterialCommunityIcons
                  name="calculator"
                  size={20}
                  color="#4A90E2"
                />
                <Text style={styles.actionButtonText}>Split Evenly</Text>
              </TouchableOpacity>
            </View>

            {Math.abs(totalSplit - totalAmount) > 0.01 && (
              <View style={styles.warning}>
                <MaterialCommunityIcons
                  name="alert"
                  size={20}
                  color="#FFA726"
                />
                <Text style={styles.warningText}>
                  Total split amount (${totalSplit.toFixed(2)}) doesn't match
                  expense amount (${totalAmount.toFixed(2)})
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={styles.saveButtonText}>Save Split</Text>
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
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2D43',
  },
  totalAmount: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#757575',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2D43',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 2,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 12,
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: '#F57C00',
    fontSize: 14,
  },
  saveButton: {
    margin: 20,
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});