import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { InviteMemberModal } from './InviteMemberModal';
import { CreateGroupModal } from './CreateGroupModal';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

interface ProfileProps {
  onLogout?: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { group, members, hasGroup, isOwner, isLoading: groupLoading, removeMember } = useGroup();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onLogout?.();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    if (!isOwner) {
      Alert.alert('Lỗi', 'Chỉ chủ nhóm mới có thể xóa thành viên');
      return;
    }

    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc chắn muốn xóa ${memberName} khỏi nhóm?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(userId);
              Alert.alert('Thành công', 'Đã xóa thành viên khỏi nhóm');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  if (authLoading || groupLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {user?.name?.charAt(0).toUpperCase() || '👨'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setShowEditProfileModal(true)}
          >
            <Ionicons name="create-outline" size={16} color="#16A34A" />
            <Text style={styles.editProfileText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Family Group */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhóm gia đình</Text>
            {hasGroup && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="person-add-outline" size={16} color="#16A34A" />
                <Text style={styles.inviteText}>Mời</Text>
              </TouchableOpacity>
            )}
          </View>

          {!hasGroup ? (
            <View style={styles.card}>
              <View style={styles.noGroupContainer}>
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noGroupTitle}>Chưa có nhóm</Text>
                <Text style={styles.noGroupText}>
                  Tạo nhóm để chia sẻ tủ lạnh và danh sách mua sắm với gia đình
                </Text>
                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => setShowCreateGroupModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Group Info */}
              <View style={styles.groupInfo}>
                <View style={styles.groupRow}>
                  <View style={styles.groupIconContainer}>
                    <Ionicons name="people" size={20} color="#16A34A" />
                  </View>
                  <View style={styles.groupDetails}>
                    <Text style={styles.groupName}>{group?.name || 'Nhóm của bạn'}</Text>
                    <Text style={styles.groupMembers}>{members.length} thành viên</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </View>

              {/* Members List */}
              {members.map((member, index) => (
                <View
                  key={member._id}
                  style={[
                    styles.memberRow,
                    index < members.length - 1 && styles.memberBorder
                  ]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.user?.name?.charAt(0).toUpperCase() || '👤'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.user?.name || 'User'}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'owner' ? 'Chủ nhóm' : 'Thành viên'}
                    </Text>
                  </View>
                  {member.role === 'owner' && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Owner</Text>
                    </View>
                  )}
                  {isOwner && member.role !== 'owner' && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.userId, member.user?.name || 'User')}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
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

            <TouchableOpacity
              style={[styles.settingRow, styles.settingBorder]}
              onPress={() => setShowChangePasswordModal(true)}
            >
              <View style={[styles.settingIcon, styles.greenIcon]}>
                <Ionicons name="key" size={20} color="#16A34A" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Đổi mật khẩu</Text>
                <Text style={styles.settingSubtitle}>Cập nhật mật khẩu bảo mật</Text>
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
          <Text style={styles.appInfoText}>© 2026 Smart Grocery Manager</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
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

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          onSuccess={() => setShowCreateGroupModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          onSuccess={() => setShowEditProfileModal(false)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => setShowChangePasswordModal(false)}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    textTransform: 'capitalize',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
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
  greenIcon: {
    backgroundColor: '#DCFCE7',
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
  noGroupContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noGroupText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 4,
  },
});