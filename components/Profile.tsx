import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { InviteMemberModal } from './InviteMemberModal';

interface ProfileProps {
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const familyMembers = [
    { id: 1, name: 'Minh Nguyễn', role: 'Admin', avatar: '👨' },
    { id: 2, name: 'Lan Trần', role: 'Member', avatar: '👩' },
    { id: 3, name: 'Hùng Lê', role: 'Member', avatar: '👦' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👨</Text>
          </View>
          <Text style={styles.userName}>Minh Nguyễn</Text>
          <Text style={styles.userEmail}>minh@example.com</Text>
        </View>

        {/* Family Group */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhóm gia đình</Text>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={() => setShowInviteModal(true)}
            >
              <Ionicons name="person-add-outline" size={16} color="#16A34A" />
              <Text style={styles.inviteText}>Mời</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Group Info */}
            <View style={styles.groupInfo}>
              <View style={styles.groupRow}>
                <View style={styles.groupIconContainer}>
                  <Ionicons name="people" size={20} color="#16A34A" />
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>Gia đình Nguyễn</Text>
                  <Text style={styles.groupMembers}>{familyMembers.length} thành viên</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </View>

            {/* Members List */}
            {familyMembers.map((member, index) => (
              <View 
                key={member.id}
                style={[
                  styles.memberRow,
                  index < familyMembers.length - 1 && styles.memberBorder
                ]}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
                {member.role === 'Admin' && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.card}>
            <TouchableOpacity style={[styles.settingRow, styles.settingBorder]}>
              <View style={[styles.settingIcon, styles.blueIcon]}>
                <Ionicons name="notifications" size={20} color="#2563EB" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Thông báo</Text>
                <Text style={styles.settingSubtitle}>Quản lý cảnh báo và thông báo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, styles.settingBorder]}>
              <View style={[styles.settingIcon, styles.purpleIcon]}>
                <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Quyền riêng tư</Text>
                <Text style={styles.settingSubtitle}>Bảo mật và quyền truy cập</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, styles.orangeIcon]}>
                <Ionicons name="help-circle" size={20} color="#EA580C" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Trợ giúp & Hỗ trợ</Text>
                <Text style={styles.settingSubtitle}>FAQ và liên hệ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn thông báo</Text>
          <View style={styles.card}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Cảnh báo hết hạn</Text>
                <Text style={styles.notificationSubtitle}>Nhận thông báo khi thực phẩm sắp hết hạn</Text>
              </View>
              <View style={styles.switch}>
                <View style={styles.switchOn}>
                  <View style={styles.switchThumb} />
                </View>
              </View>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Cập nhật mua sắm</Text>
                <Text style={styles.notificationSubtitle}>Thông báo khi có món mới hoặc đã mua</Text>
              </View>
              <View style={styles.switch}>
                <View style={styles.switchOn}>
                  <View style={styles.switchThumb} />
                </View>
              </View>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Gợi ý công thức</Text>
                <Text style={styles.notificationSubtitle}>Nhận gợi ý món ăn hàng tuần</Text>
              </View>
              <View style={styles.switch}>
                <View style={styles.switchOff}>
                  <View style={styles.switchThumb} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Đi Chợ Tiện Lợi v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Smart Grocery Manager</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal 
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)} 
        />
      )}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#D1FAE5',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inviteText: {
    fontSize: 14,
    color: '#16A34A',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  groupInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupDetails: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  groupMembers: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  memberBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 20,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueIcon: {
    backgroundColor: '#DBEAFE',
  },
  purpleIcon: {
    backgroundColor: '#EDE9FE',
  },
  orangeIcon: {
    backgroundColor: '#FED7AA',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  switch: {
    width: 44,
    height: 24,
  },
  switchOn: {
    width: 44,
    height: 24,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  switchOff: {
    width: 44,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  appInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});