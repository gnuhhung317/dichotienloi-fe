import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddToFridgeModal } from './AddToFridgeModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CreateCustomItemModal } from './CreateCustomItemModal';
import { InviteMemberModal } from './InviteMemberModal';

type ActiveModal = 'addFridge' | 'scanner' | 'customItem' | 'invite' | null;

export function Home() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Xin chào, Minh!</Text>
          <Text style={styles.greetingSubtitle}>Hôm nay bạn cần mua gì?</Text>
        </View>

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
                  <Text style={styles.cardSubtitle}>5 món cần mua</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.progressText}>60%</Text>
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
                  <Text style={styles.alertText}>3 món sắp hết hạn</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.alertItems}>
              <View style={styles.alertItem}>
                <Ionicons name="time-outline" size={16} color="#EA580C" />
                <Text style={styles.alertItemText}>Sữa tươi - Hết hạn trong 2 ngày</Text>
              </View>
              <View style={styles.alertItem}>
                <Ionicons name="time-outline" size={16} color="#EA580C" />
                <Text style={styles.alertItemText}>Cà rót - Hết hạn trong 3 ngày</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Today's Meal Card */}
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconRow}>
                <View style={styles.cardIconPurple}>
                  <Text style={styles.cardEmoji}>🍽️</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Bữa tối hôm nay</Text>
                  <Text style={styles.cardSubtitle}>Đã lên kế hoạch</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.mealRow}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' }}
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>Salad rau củ nướng</Text>
                <View style={styles.mealMeta}>
                  <Text style={styles.mealMetaText}>35 phút</Text>
                  <Text style={styles.mealMetaText}>•</Text>
                  <Text style={styles.mealMetaText}>4 người</Text>
                </View>
              </View>
            </View>
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.activities}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, styles.activityIconGreen]}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  Lan đã mua <Text style={styles.activityHighlight}>Cà chua</Text>
                </Text>
                <Text style={styles.activityTime}>5 phút trước</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, styles.activityIconBlue]}>
                <Text style={styles.activityEmoji}>➕</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  Minh đã thêm <Text style={styles.activityHighlight}>Thịt bò</Text> vào danh sách
                </Text>
                <Text style={styles.activityTime}>1 giờ trước</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, styles.activityIconOrange]}>
                <Ionicons name="alert-circle" size={16} color="#EA580C" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityHighlight}>Sữa tươi</Text> sắp hết hạn
                </Text>
                <Text style={styles.activityTime}>3 giờ trước</Text>
              </View>
            </View>
          </View>
        </View>
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
  activities: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconGreen: {
    backgroundColor: '#D1FAE5',
  },
  activityIconBlue: {
    backgroundColor: '#DBEAFE',
  },
  activityIconOrange: {
    backgroundColor: '#FED7AA',
  },
  activityEmoji: {
    fontSize: 14,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  activityHighlight: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
});