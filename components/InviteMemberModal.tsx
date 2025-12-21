import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteCode = 'GIA-DINH-123';
  const groupName = 'Gia đình Nguyễn';

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
});
