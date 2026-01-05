import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // If available, or use useEffect
import { recipeService, Recipe } from '../services/recipe.service';

import { RecipeDetailModal } from './RecipeDetailModal';

interface CookbookViewProps {
  onAddRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
}

export function CookbookView({ onAddRecipe, onEditRecipe }: CookbookViewProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortByAvailability, setSortByAvailability] = useState(false);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getRecipes(true, sortByAvailability); // Default to group recipes
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  // Re-fetch when sort option changes
  useEffect(() => {
    fetchRecipes();
  }, [sortByAvailability]);

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => {
        setSelectedRecipe(item);
        setShowDetailModal(true);
      }}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.ingredients?.length || 0} nguyên liệu</Text>
          </View>
          {item.matchPercentage !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons
                name="nutrition"
                size={12}
                color={item.matchPercentage >= 100 ? '#16A34A' : item.matchPercentage >= 50 ? '#F59E0B' : '#EF4444'}
              />
              <Text style={[styles.metaText, {
                color: item.matchPercentage >= 100 ? '#16A34A' : item.matchPercentage >= 50 ? '#F59E0B' : '#EF4444',
                fontWeight: '500'
              }]}>
                {item.matchCount}/{item.totalIngredients} có sẵn
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && recipes.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerFilter}>
        <TouchableOpacity
          style={[styles.filterButton, sortByAvailability && styles.filterButtonActive]}
          onPress={() => setSortByAvailability(!sortByAvailability)}
        >
          <Ionicons name={sortByAvailability ? "checkbox" : "square-outline"} size={20} color={sortByAvailability ? "#16A34A" : "#6B7280"} />
          <Text style={[styles.filterText, sortByAvailability && styles.filterTextActive]}>Gợi ý từ tủ lạnh</Text>
        </TouchableOpacity>
      </View>

      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchRecipes} colors={['#16A34A']} />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchRecipes} colors={['#16A34A']} />
          }
        >
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sổ tay công thức</Text>
            <Text style={styles.emptyDescription}>Bạn chưa có công thức nào. Hãy thêm công thức mới!</Text>
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button for Add */}
      <TouchableOpacity style={styles.fab} onPress={onAddRecipe}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <RecipeDetailModal
        isOpen={showDetailModal}
        recipe={selectedRecipe}
        onClose={() => setShowDetailModal(false)}
        onEdit={(recipe) => {
          setShowDetailModal(false);
          onEditRecipe(recipe);
        }}
        onDeleteSuccess={() => {
          fetchRecipes();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeContent: {
    flex: 1,
    padding: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  headerFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButtonActive: {

  },
  filterText: {
    fontSize: 14,
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  }
});
