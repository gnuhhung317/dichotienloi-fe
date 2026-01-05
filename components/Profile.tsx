import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
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
  const { t, i18n } = useTranslation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { group, members, hasGroup, isOwner, isLoading: groupLoading, removeMember } = useGroup();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLanguageChange = async (language: 'en' | 'vi') => {
    await changeLanguage(language);
  };

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
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
      Alert.alert(t('common.error'), t('profile.onlyOwnerCanRemove'));
      return;
    }

    Alert.alert(
      t('profile.removeMember'),
      t('profile.confirmRemoveMember'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(userId);
              Alert.alert(t('common.success'), t('profile.removeMember'));
            } catch (error: any) {
              Alert.alert(t('common.error'), error.message);
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
            <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Family Group */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.groupInfo')}</Text>
            {hasGroup && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="person-add-outline" size={16} color="#16A34A" />
                <Text style={styles.inviteText}>{t('profile.inviteMember')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {!hasGroup ? (
            <View style={styles.card}>
              <View style={styles.noGroupContainer}>
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noGroupTitle}>{t('profile.noGroup')}</Text>
                <Text style={styles.noGroupText}>
                  {t('profile.noGroup')}
                </Text>
                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => setShowCreateGroupModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.createGroupText}>{t('profile.createGroup')}</Text>
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
                    <Text style={styles.groupName}>{group?.name || t('profile.groupName')}</Text>
                    <Text style={styles.groupMembers}>{members.length} {t('profile.groupMembers')}</Text>
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
                      {member.role === 'owner' ? t('profile.owner') : t('profile.member')}
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

        {/* Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.reports')}</Text>
          <View style={styles.card}>
            <Link href="/report" asChild>
              <TouchableOpacity style={styles.settingRow}>
                <View style={[styles.settingIcon, styles.orangeIcon]}>
                  <Ionicons name="bar-chart" size={20} color="#EA580C" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{t('profile.shoppingConsumptionReport')}</Text>
                  <Text style={styles.settingSubtitle}>{t('profile.viewStatistics')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.card}>
            {/* Language Switcher */}
            <View style={[styles.settingRow, styles.settingBorder]}>
              <View style={[styles.settingIcon, styles.greenIcon]}>
                <Ionicons name="language" size={20} color="#16A34A" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('profile.language')}</Text>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      i18n.language === 'en' && styles.languageButtonActive
                    ]}
                    onPress={() => handleLanguageChange('en')}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      i18n.language === 'en' && styles.languageButtonTextActive
                    ]}>English</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      i18n.language === 'vi' && styles.languageButtonActive
                    ]}
                    onPress={() => handleLanguageChange('vi')}
                  >
                    <Text style={[
                      styles.languageButtonText,
                      i18n.language === 'vi' && styles.languageButtonTextActive
                    ]}>Tiếng Việt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.settingRow, styles.settingBorder]}>
              <View style={[styles.settingIcon, styles.blueIcon]}>
                <Ionicons name="notifications" size={20} color="#2563EB" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
                <Text style={styles.settingSubtitle}>{t('notifications.title')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, styles.settingBorder]}>
              <View style={[styles.settingIcon, styles.purpleIcon]}>
                <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('profile.privacy')}</Text>
                <Text style={styles.settingSubtitle}>{t('profile.privacy')}</Text>
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
                <Text style={styles.settingTitle}>{t('profile.changePassword')}</Text>
                <Text style={styles.settingSubtitle}>{t('profile.changePassword')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, styles.orangeIcon]}>
                <Ionicons name="help-circle" size={20} color="#EA580C" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('profile.about')}</Text>
                <Text style={styles.settingSubtitle}>{t('profile.about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.title')}</Text>
          <View style={styles.card}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>{t('notifications.expiryAlert')}</Text>
                <Text style={styles.notificationSubtitle}>{t('notifications.expiryAlert')}</Text>
              </View>
              <View style={styles.switch}>
                <View style={styles.switchOn}>
                  <View style={styles.switchThumb} />
                </View>
              </View>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>{t('notifications.shoppingReminder')}</Text>
                <Text style={styles.notificationSubtitle}>{t('notifications.shoppingReminder')}</Text>
              </View>
              <View style={styles.switch}>
                <View style={styles.switchOn}>
                  <View style={styles.switchThumb} />
                </View>
              </View>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>{t('suggestion.recipeIdeas')}</Text>
                <Text style={styles.notificationSubtitle}>{t('suggestion.recipeIdeas')}</Text>
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
          <Text style={styles.appInfoText}>Đi Chợ Tiện Lợi v{t('profile.version')} 1.0.0</Text>
          <Text style={styles.appInfoText}>© 2026 Smart Grocery Manager</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
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
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  languageButtonActive: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  languageButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#16A34A',
    fontWeight: '600',
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