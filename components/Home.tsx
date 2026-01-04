import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AddToFridgeModal } from './AddToFridgeModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CreateCustomItemModal } from './CreateCustomItemModal';
import { InviteMemberModal } from './InviteMemberModal';

import { shoppingService, ShoppingItem } from '../services/shopping.service';
import { fridgeService, FridgeItem } from '../services/fridge.service';
import { mealService, MealPlanItem } from '../services/meal.service';

import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

type ActiveModal = 'addFridge' | 'scanner' | 'customItem' | 'invite' | null;

export function Home() {
  const { user } = useAuth();
  const { hasGroup } = useGroup();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data State
  const [shoppingCount, setShoppingCount] = useState(0);
  const [totalShoppingItems, setTotalShoppingItems] = useState(0); // For progress bar
  const [expiringItems, setExpiringItems] = useState<FridgeItem[]>([]);
  const [todayMeal, setTodayMeal] = useState<MealPlanItem | null>(null);

  const loadData = async () => {
    if (!hasGroup) return;
    try {
      setIsLoading(true);

      // 1. Fetch Shopping List
      const shoppingItems = await shoppingService.getShoppingItems();
      const unbought = shoppingService.getUnboughtCount(shoppingItems);
      setShoppingCount(unbought);
      setTotalShoppingItems(shoppingItems.length);

      // 2. Fetch Fridge Items & Filter Expiring (next 3 days)
      const fridgeItems = await fridgeService.getFridgeItems();
      const expiring = fridgeItems.filter(item => {
        const days = fridgeService.calculateDaysUntilExpiry(item.expiredAt);
        return days <= 3 && item.status === 'available'; // Expiring soon or expired
      }).sort((a, b) => new Date(a.expiredAt).getTime() - new Date(b.expiredAt).getTime());

      setExpiringItems(expiring.slice(0, 3)); // Top 3 expiring

      // 3. Fetch Today's Meal (Dinner priority, then Lunch, then Breakfast)
      const today = new Date();
      const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

      const weeklyPlan = await mealService.getWeeklyPlan(startOfDay, endOfDay);

      // Find meal for today. Prioritize Dinner -> Lunch -> Breakfast if currently empty state?
      // Actually, let's just pick the next upcoming meal or just Dinner if available.
      // Logic: If it's morning, show Breakfast/Lunch. If evening, show Dinner.
      // For simplicity: Find the first meal of today (sorted by type usually fixed order in UI, but here list).
      // Let's look for Dinner first as "Main Event", else Lunch.
      const dinner = weeklyPlan.find(m => m.mealType === 'dinner');
      const lunch = weeklyPlan.find(m => m.mealType === 'lunch');
      const breakfast = weeklyPlan.find(m => m.mealType === 'breakfast');

      setTodayMeal(dinner || lunch || breakfast || null);

    } catch (error) {
      console.error('Home load data error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (hasGroup) {
        loadData();
      }
    }, [hasGroup])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (hasGroup) {
      loadData();
    } else {
      setRefreshing(false);
    }
  };

  // Helper for progress
  const shoppingProgress = totalShoppingItems > 0
    ? Math.round(((totalShoppingItems - shoppingCount) / totalShoppingItems) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />}
    >
      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Xin chào, {user?.name || 'Bạn'}!</Text>
          <Text style={styles.greetingSubtitle}>{hasGroup ? 'Hôm nay bạn cần mua gì?' : 'Bạn chưa tham gia nhóm nào.'}</Text>
        </View>

        {!hasGroup ? (
          <View style={styles.emptyGroupState}>
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyGroupText}>
              Vui lòng tạo hoặc tham gia một nhóm để sử dụng các tính năng mua sắm và quản lý tủ lạnh.
            </Text>
            <TouchableOpacity style={styles.createGroupButton} onPress={() => setActiveModal('invite')}>
              <Text style={styles.createGroupButtonText}>Tham gia ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>

            {/* Quick Summary Cards */}
            <View style={styles.summaryCards}>
              {/* Shopping List Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconRow}>
                    <View style={styles.cardIconGreen}>
                      <Text style={styles.cardEmoji}>🛒</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>Danh sách mua sắm</Text>
                      <Text style={styles.cardSubtitle}>
                        {shoppingCount > 0 ? `${shoppingCount} món cần mua` : 'Đã mua đủ'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${shoppingProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{shoppingProgress}%</Text>
                </View>
              </TouchableOpacity>

              {/* Fridge Alert Card */}
              <TouchableOpacity style={[styles.card, styles.alertCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconRow}>
                    <View style={styles.cardIconOrange}>
                      <Ionicons name="alert-circle" size={20} color="#EA580C" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>Cảnh báo tủ lạnh</Text>
                      <Text style={styles.alertText}>
                        {expiringItems.length > 0
                          ? `${expiringItems.length} món sắp hết hạn`
                          : 'Tủ lạnh an toàn'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>

                {expiringItems.length > 0 && (
                  <View style={styles.alertItems}>
                    {expiringItems.map(item => {
                      const days = fridgeService.calculateDaysUntilExpiry(item.expiredAt);
                      const label = days < 0 ? 'Đã hết hạn' : days === 0 ? 'Hết hạn hôm nay' : `${days} ngày nữa`;
                      const foodName = typeof item.foodId === 'string' ? 'Món ăn' : item.foodId.name;
                      return (
                        <View key={item._id} style={styles.alertItem}>
                          <Ionicons name="time-outline" size={16} color="#EA580C" />
                          <Text style={styles.alertItemText} numberOfLines={1}>
                            {foodName} - {label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>

              {/* Today's Meal Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconRow}>
                    <View style={styles.cardIconPurple}>
                      <Text style={styles.cardEmoji}>🍽️</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>Thực đơn hôm nay</Text>
                      <Text style={styles.cardSubtitle}>
                        {todayMeal ? 'Đã lên kế hoạch' : 'Chưa có kế hoạch'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>

                {todayMeal ? (
                  <View style={styles.mealRow}>
                    <Image
                      source={{ uri: todayMeal.recipeId.image || 'https://via.placeholder.com/150' }}
                      style={styles.mealImage}
                    />
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{todayMeal.recipeId.name}</Text>
                      <View style={styles.mealMeta}>
                        <Text style={styles.mealMetaText}>
                          {todayMeal.mealType === 'dinner' ? 'Bữa tối' : todayMeal.mealType === 'lunch' ? 'Bữa trưa' : 'Bữa sáng'}
                        </Text>
                        <Text style={styles.mealMetaText}>•</Text>
                        <Text style={styles.mealMetaText}>{todayMeal.recipeId.description || 'Món ngon mỗi ngày'}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyMealState}>
                    <Text style={styles.emptyMealText}>Chưa có món nào cho hôm nay</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('addFridge')}>
                  <View style={[styles.actionIcon, styles.actionIconGreen]}>
                    <Text style={styles.actionEmoji}>➕</Text>
                  </View>
                  <Text style={styles.actionText}>Thêm vào tủ lạnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('scanner')}>
                  <View style={[styles.actionIcon, styles.actionIconBlue]}>
                    <Text style={styles.actionEmoji}>📱</Text>
                  </View>
                  <Text style={styles.actionText}>Quét mã vạch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('customItem')}>
                  <View style={[styles.actionIcon, styles.actionIconPurple]}>
                    <Text style={styles.actionEmoji}>📝</Text>
                  </View>
                  <Text style={styles.actionText}>Thêm món mới</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('invite')}>
                  <View style={[styles.actionIcon, styles.actionIconOrange]}>
                    <Text style={styles.actionEmoji}>👥</Text>
                  </View>
                  <Text style={styles.actionText}>Mời thành viên</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Activity - Kept static for now as requested to focus on main cards, but could be dynamic later */}
            {/* <View style={styles.section}> ... </View> */}
          </>
        )}
      </View>

      {/* Modals */}
      <AddToFridgeModal
        isOpen={activeModal === 'addFridge'}
        onClose={() => setActiveModal(null)}
      />
      <BarcodeScannerModal
        isOpen={activeModal === 'scanner'}
        onClose={() => setActiveModal(null)}
      />
      <CreateCustomItemModal
        isOpen={activeModal === 'customItem'}
        onClose={() => setActiveModal(null)}
      />
      <InviteMemberModal
        isOpen={activeModal === 'invite'}
        onClose={() => setActiveModal(null)}
      />
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
  greeting: {
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryCards: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  alertCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconGreen: {
    width: 40,
    height: 40,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconOrange: {
    width: 40,
    height: 40,
    backgroundColor: '#FED7AA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconPurple: {
    width: 40,
    height: 40,
    backgroundColor: '#E9D5FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  alertText: {
    fontSize: 14,
    color: '#EA580C',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertItems: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealImage: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  mealMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  mealMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyMealState: {
    paddingVertical: 12,
  },
  emptyMealText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconGreen: {
    backgroundColor: '#D1FAE5',
  },
  actionIconBlue: {
    backgroundColor: '#DBEAFE',
  },
  actionIconPurple: {
    backgroundColor: '#E9D5FF',
  },
  actionIconOrange: {
    backgroundColor: '#FED7AA',
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
  },
  /* Activity styles removed for now as section is hidden/removed */
  emptyGroupState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyGroupText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    maxWidth: '80%',
    lineHeight: 24,
  },
  createGroupButton: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
  },
  createGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});