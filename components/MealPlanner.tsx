import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddMealModal } from './AddMealModal';
import { CookbookView } from './CookbookView';

export function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; mealType: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'cookbook'>('plan');

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const meals = ['Sáng', 'Trưa', 'Tối'];

  const mealPlan: Record<string, any> = {
    'T2-Tối': {
      name: 'Salad rau củ nướng',
      time: '35 phút',
      servings: '4 người',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    },
    'T3-Trưa': {
      name: 'Phở bò',
      time: '60 phút',
      servings: '4 người',
      image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=200&h=200&fit=crop',
    },
    'T4-Tối': {
      name: 'Cơm gà chiên',
      time: '45 phút',
      servings: '4 người',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop',
    },
    'T6-Tối': {
      name: 'Pizza homemade',
      time: '50 phút',
      servings: '4 người',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    },
  };

  const getDayDate = (dayIndex: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    return date.getDate();
  };

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
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentWeek(currentWeek + 1)}
              style={styles.weekButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'cookbook' && (
          <View style={styles.cookbookHeader}>
            <Text style={styles.cookbookTitle}>Sổ tay công thức</Text>
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
          </View>
        </View>

        {/* Days Row (only for Plan tab) */}
        {activeTab === 'plan' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
            {days.map((day, index) => {
              const isToday = currentWeek === 0 && index === new Date().getDay() - 1;
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, isToday && styles.dayButtonActive]}
                >
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{day}</Text>
                  <Text style={[styles.dayDate, isToday && styles.dayDateActive]}>{getDayDate(index)}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      {activeTab === 'plan' ? (
        <>
          {/* Meal Grid */}
          <ScrollView style={styles.mealGrid}>
            {days.map((day) => (
              <View key={day} style={styles.daySection}>
                <Text style={styles.daySectionTitle}>{day}, {getDayDate(days.indexOf(day))} Tháng 12</Text>
                <View style={styles.mealsContainer}>
                  {meals.map((meal) => {
                    const mealKey = `${day}-${meal}`;
                    const plannedMeal = mealPlan[mealKey];

                    return (
                      <View key={meal} style={styles.mealCard}>
                        <View style={styles.mealRow}>
                          <View style={styles.mealTimeLabel}>
                            <Text style={styles.mealTimeText}>{meal}</Text>
                          </View>
                          {plannedMeal ? (
                            <View style={styles.plannedMeal}>
                              <Image
                                source={{ uri: plannedMeal.image }}
                                style={styles.mealImage}
                              />
                              <View style={styles.mealInfo}>
                                <Text style={styles.mealName}>{plannedMeal.name}</Text>
                                <View style={styles.mealMeta}>
                                  <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={12} color="#6B7280" />
                                    <Text style={styles.metaText}>{plannedMeal.time}</Text>
                                  </View>
                                  <View style={styles.metaItem}>
                                    <Ionicons name="people-outline" size={12} color="#6B7280" />
                                    <Text style={styles.metaText}>{plannedMeal.servings}</Text>
                                  </View>
                                </View>
                              </View>
                              <TouchableOpacity style={styles.detailButton}>
                                <Text style={styles.detailButtonText}>Chi tiết</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.addMealButton}
                              onPress={() => {
                                setSelectedMeal({ day, mealType: meal });
                                setShowAddModal(true);
                              }}
                            >
                              <Ionicons name="add" size={16} color="#9CA3AF" />
                              <Text style={styles.addMealText}>Thêm món ăn</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Recipe Suggestions Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.suggestButton}>
              <Text style={styles.suggestButtonText}>Gợi ý công thức</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <CookbookView
          onAddRecipe={() => {
            setShowAddModal(true);
            setSelectedMeal(null);
          }}
        />
      )}

      {/* Add Meal Modal */}
      {showAddModal && (
        <AddMealModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMeal(null);
          }}
          mealType={selectedMeal?.mealType}
          day={selectedMeal?.day}
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
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestButton: {
    paddingVertical: 12,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
  },
  suggestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
