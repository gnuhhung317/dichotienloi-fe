import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CookbookViewProps {
  onAddRecipe: () => void;
}

export function CookbookView({ onAddRecipe }: CookbookViewProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Sổ tay công thức</Text>
          <Text style={styles.emptyDescription}>Chức năng đang được phát triển</Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={onAddRecipe}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm công thức</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
