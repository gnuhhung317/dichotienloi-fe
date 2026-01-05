import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AddMealModal } from './AddMealModal';
import { CookbookView } from './CookbookView';
import { AddRecipeModal } from './AddRecipeModal';
import { SuggestionView } from './SuggestionView';
import { mealService, MealPlanItem } from '../services/meal.service';
import { Recipe } from '../services/recipe.service';

import { useGroup } from '../context/GroupContext';

export function MealPlanner() {
  const { t } = useTranslation();
  const { hasGroup } = useGroup();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ date: Date; mealType: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'cookbook' | 'suggest'>('plan');

  const [weeklyPlan, setWeeklyPlan] = useState<MealPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Callback to refresh cookbook if needed. For now, CookbookView fetches on mount/focus.
  // Since we are not unmounting CookbookView when modal opens (it's a modal), we might need to signal update.
  // But standard React: if CookbookView is in tree, we can Key it or use context.
  // Simpler: Just rely on simple refresh or pass a "refreshTrigger" prop.
  const [refreshCookbook, setRefreshCookbook] = useState(0);

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const meals = ['breakfast', 'lunch', 'dinner']; // Backend enum keys
  const mealLabels: Record<string, string> = { 
    'breakfast': t('meal.breakfast'), 
    'lunch': t('meal.lunch'), 
    'dinner': t('meal.dinner') 
  };

  useEffect(() => {
    if (activeTab === 'plan' && hasGroup) {
      loadWeeklyPlan();
    }
  }, [currentWeek, activeTab, hasGroup]);

  // ... (rest of methods)

  // In render:
  // ... split implementation to next Replace call for cleaner diff


  const getWeekRange = () => {
    const today = new Date();
    // Adjust to Monday of current week (assuming week starts Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (currentWeek * 7);

    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const getDayDate = (dayIndex: number) => {
    const { startOfWeek } = getWeekRange();
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const loadWeeklyPlan = async () => {
    try {
      setIsLoading(true);
      const { startOfWeek, endOfWeek } = getWeekRange();
      const data = await mealService.getWeeklyPlan(startOfWeek, endOfWeek);
      setWeeklyPlan(data);
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMeal = (itemId: string) => {
    Alert.alert(t('meal.deleteMeal'), t('meal.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await mealService.removeRecipeFromMealPlan(itemId);
            setWeeklyPlan(prev => prev.filter(m => m._id !== itemId));
          } catch (error) {
            Alert.alert(t('common.error'), t('errors.somethingWentWrong'));
          }
        }
      }
    ]);
  };

  const getPlannedMeal = (dayIndex: number, mealType: string) => {
    const date = getDayDate(dayIndex);
    return weeklyPlan.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        item.mealType === mealType;
    });
  };

  if (!hasGroup) {
    return (
      <View style={styles.container}>
        <View style={styles.cookbookHeader}>
          <Text style={styles.cookbookTitle}>Thực đơn & Sổ tay</Text>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 12 }}>{t('fridge.noGroupTitle')}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>{t('modal.requireGroupForMeal')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Week Selector (only for Plan tab) */}
        {activeTab === 'plan' && (
          <View style={styles.weekSelector}>
            <TouchableOpacity
              onPress={() => setCurrentWeek(currentWeek - 1)}
              style={styles.weekButton}
            >
              <Ionicons name="chevron-back" size={20} color="#4B5563" />
            </TouchableOpacity>
            <Text style={styles.weekTitle}>
              {currentWeek === 0 ? 'Tuần này' : `Tuần ${currentWeek > 0 ? '+' + currentWeek : currentWeek}`}
              <Text style={styles.weekDateRange}>
                {` (${getWeekRange().startOfWeek.getDate()}/${getWeekRange().startOfWeek.getMonth() + 1} - ${getWeekRange().endOfWeek.getDate()}/${getWeekRange().endOfWeek.getMonth() + 1})`}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentWeek(currentWeek + 1)}
              style={styles.weekButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )}

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <View style={styles.segmentedBg}>
            <TouchableOpacity
              onPress={() => setActiveTab('plan')}
              style={[styles.segment, activeTab === 'plan' && styles.segmentActive]}
            >
              <Ionicons name="calendar-outline" size={16} color={activeTab === 'plan' ? '#16A34A' : '#6B7280'} />
              <Text style={[styles.segmentText, activeTab === 'plan' && styles.segmentTextActive]}>Lịch ăn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('cookbook')}
              style={[styles.segment, activeTab === 'cookbook' && styles.segmentActive]}
            >
              <Ionicons name="book-outline" size={16} color={activeTab === 'cookbook' ? '#16A34A' : '#6B7280'} />
              <Text style={[styles.segmentText, activeTab === 'cookbook' && styles.segmentTextActive]}>Sổ tay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('suggest')}
              style={[styles.segment, activeTab === 'suggest' && styles.segmentActive]}
            >
              <Ionicons name="bulb-outline" size={16} color={activeTab === 'suggest' ? '#16A34A' : '#6B7280'} />
              <Text style={[styles.segmentText, activeTab === 'suggest' && styles.segmentTextActive]}>{t('common.suggest')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days Row (only for Plan tab) */}
        {activeTab === 'plan' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
            {days.map((day, index) => {
              const date = getDayDate(index);
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, isToday && styles.dayButtonActive]}
                >
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{day}</Text>
                  <Text style={[styles.dayDate, isToday && styles.dayDateActive]}>{date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      {activeTab === 'plan' ? (
        isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16A34A" />
          </View>
        ) : (
          <>
            {/* Meal Grid */}
            <ScrollView style={styles.mealGrid}>
              {days.map((day, dayIndex) => (
                <View key={day} style={styles.daySection}>
                  <Text style={styles.daySectionTitle}>{day}, {getDayDate(dayIndex).getDate()} Tháng {getDayDate(dayIndex).getMonth() + 1}</Text>
                  <View style={styles.mealsContainer}>
                    {meals.map((mealType) => {
                      // Filter for ALL meals in this slot
                      const plannedMeals = weeklyPlan.filter(item => {
                        const itemDate = new Date(item.date);
                        const date = getDayDate(dayIndex);
                        return itemDate.getDate() === date.getDate() &&
                          itemDate.getMonth() === date.getMonth() &&
                          item.mealType === mealType;
                      });

                      return (
                        <View key={mealType} style={styles.mealCard}>
                          <View style={styles.mealHeader}>
                            <Text style={styles.mealTimeText}>{mealLabels[mealType]}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedMeal({ date: getDayDate(dayIndex), mealType });
                                setShowAddModal(true);
                              }}
                            >
                              <Ionicons name="add-circle" size={24} color="#16A34A" />
                            </TouchableOpacity>
                          </View>

                          {plannedMeals.length > 0 ? (
                            <View style={styles.mealList}>
                              {plannedMeals.map((meal) => (
                                <View key={meal._id} style={styles.mealItem}>
                                  <Image
                                    source={{ uri: meal.recipeId.image || 'https://via.placeholder.com/150' }}
                                    style={styles.mealImage}
                                  />
                                  <View style={styles.mealInfo}>
                                    <Text style={styles.mealName}>{meal.recipeId.name}</Text>
                                  </View>
                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleRemoveMeal(meal._id)}
                                  >
                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <View style={styles.emptySlot}>
                              <Text style={styles.emptySlotText}>{t('meal.noMealYet')}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )
      ) : activeTab === 'cookbook' ? (
        <CookbookView
          key={refreshCookbook} // Force remount to refresh
          onAddRecipe={() => {
            setEditingRecipe(null);
            setShowAddRecipeModal(true);
          }}
          onEditRecipe={(recipe) => {
            setEditingRecipe(recipe);
            setShowAddRecipeModal(true);
          }}
        />
      ) : (
        <SuggestionView onAddSuccess={() => {
          // Maybe switch to Plan tab?
          // setActiveTab('plan');
          loadWeeklyPlan(); // Refresh logic
        }} />
      )}

      {/* Add Meal Modal Wrapper - Using existing component but needs logic update or separate component */}
      {/* Current AddMealModal is likely just a stub or strictly for new definitions. 
          We need a way to SELECT a recipe. For now, I'll temporarily disable strict modal usage 
          and rely on user confirmation that they need "Select Recipe" flow. 
      */}
      {showAddModal && selectedMeal && (
        <AddMealModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMeal(null);
          }}
          mealType={selectedMeal.mealType}
          date={selectedMeal.date}
          onSuccess={() => {
            loadWeeklyPlan(); // Refresh the plan
          }}
        />
      )}

      {showAddRecipeModal && (
        <AddRecipeModal
          isOpen={showAddRecipeModal}
          onClose={() => setShowAddRecipeModal(false)}
          onSuccess={() => {
            setRefreshCookbook(prev => prev + 1); // Trigger refresh
          }}
          initialData={editingRecipe}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  weekButton: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cookbookHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  cookbookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  segmentedControl: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  segmentedBg: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#16A34A',
    fontWeight: '500',
  },
  daysRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dayButton: {
    width: 48,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dayButtonActive: {
    backgroundColor: '#16A34A',
  },
  dayLabel: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  dayDateActive: {
    color: '#FFFFFF',
  },
  mealGrid: {
    flex: 1,
    padding: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  mealsContainer: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  mealTimeLabel: {
    width: 48,
    alignItems: 'center',
  },
  mealTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  plannedMeal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  mealMeta: {
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
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
  addMealButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addMealText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mealList: {
    padding: 12,
    gap: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  emptySlot: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  weekDateRange: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
