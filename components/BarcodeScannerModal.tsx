import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScanState = 'scanning' | 'found' | 'notfound';

export function BarcodeScannerModal({ isOpen, onClose }: BarcodeScannerModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [flashOn, setFlashOn] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const foundProduct = {
    name: 'Nước tương Chin-su',
    defaultExpiry: 365,
  };

  const handleScan = () => {
    setTimeout(() => {
      setScanState(Math.random() > 0.5 ? 'found' : 'notfound');
    }, 1000);
  };

  const handleClose = () => {
    setScanState('scanning');
    setShowManualInput(false);
    setManualCode('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {scanState === 'scanning' && (
          <>
            {/* Camera View Simulation */}
            <View style={styles.cameraView}>
              {/* Scanning Frame */}
              <View style={styles.scanFrame}>
                <View style={styles.frameContainer}>
                  {/* Corner decorations */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                  
                  {/* Scanning line */}
                  <View style={styles.scanLine} />
                </View>
                <Text style={styles.scanInstruction}>Căn mã vạch vào khung</Text>
              </View>
            </View>

            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, flashOn && styles.flashActive]}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Ionicons name="flash" size={24} color={flashOn ? '#000000' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                <View style={styles.scanButtonInner} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setShowManualInput(true)}
              >
                <Ionicons name="keypad-outline" size={20} color="#FFFFFF" />
                <Text style={styles.manualButtonText}>Nhập mã thủ công</Text>
              </TouchableOpacity>
            </View>

            {/* Manual Input Overlay */}
            {showManualInput && (
              <View style={styles.manualOverlay}>
                <View style={styles.manualCard}>
                  <View style={styles.manualHeader}>
                    <Text style={styles.manualTitle}>Nhập mã vạch</Text>
                    <TouchableOpacity onPress={() => setShowManualInput(false)}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.manualInput}
                    placeholder="8934567890123"
                    placeholderTextColor="#9CA3AF"
                    value={manualCode}
                    onChangeText={setManualCode}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                      setShowManualInput(false);
                      handleScan();
                    }}
                  >
                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Found State */}
        {scanState === 'found' && (
          <View style={styles.resultOverlay}>
            <View style={styles.resultCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
              </View>
              <Text style={styles.resultTitle}>Tìm thấy sản phẩm!</Text>

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{foundProduct.name}</Text>
                <Text style={styles.productDetail}>Chai 500ml</Text>
              </View>

              <View style={styles.expirySection}>
                <Text style={styles.expiryLabel}>
                  Hạn sử dụng (gợi ý: {foundProduct.defaultExpiry} ngày)
                </Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="Chọn ngày hết hạn"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.resultCancelButton} onPress={handleClose}>
                  <Text style={styles.resultCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resultSaveButton} onPress={handleClose}>
                  <Text style={styles.resultSaveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Not Found State */}
        {scanState === 'notfound' && (
          <View style={styles.resultOverlay}>
            <View style={styles.resultCard}>
              <View style={styles.notFoundIcon}>
                <Text style={styles.notFoundEmoji}>📦</Text>
              </View>
              <Text style={styles.resultTitle}>Chưa có dữ liệu</Text>
              <Text style={styles.notFoundSubtitle}>
                Chưa có thông tin cho mã này. Bạn có thể thêm thủ công.
              </Text>

              <View style={styles.manualForm}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Tên sản phẩm *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Nước tương..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Hạn sử dụng</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Chọn ngày hết hạn"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.resultCancelButton}
                  onPress={() => setScanState('scanning')}
                >
                  <Text style={styles.resultCancelText}>Quét lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resultSaveButton} onPress={handleClose}>
                  <Text style={styles.resultSaveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    alignItems: 'center',
  },
  frameContainer: {
    width: 256,
    height: 256,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#16A34A',
  },
  cornerTopLeft: {
    top: -4,
    left: -4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: -4,
    right: -4,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: -4,
    left: -4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: -4,
    right: -4,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#16A34A',
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashActive: {
    backgroundColor: '#EAB308',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  manualOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  manualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundEmoji: {
    fontSize: 64,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  productInfo: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  expirySection: {
    marginBottom: 24,
  },
  expiryLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  manualForm: {
    gap: 16,
    marginBottom: 24,
  },
  formField: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultCancelText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  resultSaveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultSaveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
