import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useGroup } from '../context/GroupContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { addMember, group } = useGroup();
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tạm thời dùng invite code (có thể implement sau)
  const inviteCode = group?._id?.substring(0, 8).toUpperCase() || 'GROUP-CODE';
  const groupName = group?.name || 'Nhóm của bạn';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bạn được mời tham gia nhóm ${groupName} trên app Đi Chợ Tiện Lợi. Mã mời: ${inviteCode}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleAddMember = async () => {
    if (!userId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập User ID');
      return;
    }

    setIsLoading(true);
    try {
      await addMember(userId.trim());
      Alert.alert('Thành công', 'Đã thêm thành viên vào nhóm!');
      setUserId('');
      onClose();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm thành viên');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Mời thành viên</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Mã mời</Text>
            <View style={styles.codeContainer}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{inviteCode}</Text>
              </View>
              <TouchableOpacity style={[styles.copyButton, copied && styles.copyButtonSuccess]} onPress={handleCopy}>
                <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color={copied ? "#FFFFFF" : "#374151"} />
                <Text style={[styles.copyButtonText, copied && styles.copyButtonTextSuccess]}>
                  {copied ? 'Đã sao' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Chia sẻ mã này để mời người khác tham gia</Text>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Chia sẻ mã mời</Text>
            </TouchableOpacity>

            {/* Hoặc thêm trực tiếp bằng User ID */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Thêm bằng User ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập User ID của thành viên"
              value={userId}
              onChangeText={setUserId}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleAddMember}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Thêm thành viên</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 390,
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
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  codeBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  copyButtonSuccess: {
    backgroundColor: '#16A34A',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  copyButtonTextSuccess: {
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
