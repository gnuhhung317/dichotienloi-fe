import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Fridge() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tất cả', icon: '🏪' },
    { id: 'vegetables', label: 'Rau củ', icon: '🥬' },
    { id: 'meat', label: 'Thịt', icon: '🥩' },
    { id: 'dairy', label: 'Sữa', icon: '🥛' },
    { id: 'frozen', label: 'Đông lạnh', icon: '❄️' },
  ];

  const items = [
    {
      id: 1,
      name: 'Sữa tươi',
      category: 'dairy',
      quantity: '2 hộp',
      expiry: '2 ngày',
      status: 'expiring',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Cà rót',
      category: 'vegetables',
      quantity: '5 quả',
      expiry: '3 ngày',
      status: 'expiring',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Thịt bò',
      category: 'meat',
      quantity: '500g',
      expiry: '7 ngày',
      status: 'fresh',
      image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200&h=200&fit=crop',
    },
    {
      id: 4,
      name: 'Cải bó xôi',
      category: 'vegetables',
      quantity: '1 bó',
      expiry: '10 ngày',
      status: 'fresh',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'fresh':
        return styles.statusFresh;
      case 'expiring':
        return styles.statusExpiring;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm trong tủ lạnh..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid-outline'} 
              size={20} 
              color="#4B5563" 
            />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setActiveCategory(category.id)}
              style={[
                styles.categoryChip,
                activeCategory === category.id && styles.categoryChipActive
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                activeCategory === category.id && styles.categoryLabelActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid/List */}
      <ScrollView style={styles.itemsContainer}>
        {viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {items.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <Image source={{ uri: item.image }} style={styles.gridItemImage} />
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.statusText}>{item.expiry}</Text>
                </View>
                <View style={styles.gridItemInfo}>
                  <Text style={styles.gridItemName}>{item.name}</Text>
                  <Text style={styles.gridItemQuantity}>{item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {items.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Image source={{ uri: item.image }} style={styles.listItemImage} />
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  <Text style={styles.listItemQuantity}>{item.quantity}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.statusText}>{item.expiry}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#16A34A',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  itemsContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridItemImage: {
    width: '100%',
    aspectRatio: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusFresh: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  statusExpiring: {
    backgroundColor: '#FED7AA',
    borderColor: '#FDBA74',
  },
  statusDefault: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#111827',
  },
  gridItemInfo: {
    padding: 12,
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  gridItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listItemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  listItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 32,
    width: 56,
    height: 56,
    backgroundColor: '#16A34A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
