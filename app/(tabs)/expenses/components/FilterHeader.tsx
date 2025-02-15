import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FilterHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export function FilterHeader({
  search,
  onSearchChange,
  onFilterPress,
  activeFilterCount,
}: FilterHeaderProps) {
  const router = useRouter();

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.recurringButton}
          onPress={() => router.push('/expenses/recurring')}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color="#4A90E2"
          />
          <Text style={styles.recurringButtonText}>Recurring</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color="#4A90E2"
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#757575"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={search}
            onChangeText={onSearchChange}
          />
          {search ? (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
  recurringButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2A2D43',
  },
});
