import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { recipeService, Recipe } from '../services/recipe.service';
import { mealService } from '../services/meal.service';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  date: Date; // Passed as Date object
  onSuccess?: () => void;
}

export function AddMealModal({ isOpen, onClose, mealType, date, onSuccess }: AddMealModalProps) {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mealLabels: Record<string, string> = {
    'breakfast': t('meal.breakfast'),
    'lunch': t('meal.lunch'),
    'dinner': t('meal.dinner')
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
    }
  }, [isOpen]);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getRecipes(true);
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    try {
      setIsSubmitting(true);
      await mealService.addRecipeToMealPlan({
        recipeId: recipe._id,
        date: date.toISOString(),
        mealType: mealType
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể thêm món ăn vào lịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Thêm món ăn</Text>
              <Text style={styles.subtitle}>
                {date.getDate()}/{date.getMonth() + 1} - {mealLabels[mealType] || mealType}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm công thức..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color="#16A34A" />
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map(recipe => (
                  <TouchableOpacity
                    key={recipe._id}
                    style={styles.recipeItem}
                    onPress={() => handleSelectRecipe(recipe)}
                    disabled={isSubmitting}
                  >
                    <Image
                      source={{ uri: recipe.image || 'https://via.placeholder.com/150' }}
                      style={styles.recipeImage}
                    />
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <Text style={styles.recipeDesc} numberOfLines={1}>{recipe.description}</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#16A34A" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có công thức nào. Hãy tạo công thức trước!</Text>
              )}
            </ScrollView>
          )}

          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%', // Taller modal
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recipeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  }
});
