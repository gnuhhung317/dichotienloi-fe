import { X, Plus, Scan, Sparkles } from 'lucide-react';

interface AddMenuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'manual' | 'barcode' | 'custom') => void;
}

export function AddMenuBottomSheet({ isOpen, onClose, onSelectOption }: AddMenuBottomSheetProps) {
  if (!isOpen) return null;

  const handleOptionClick = (option: 'manual' | 'barcode' | 'custom') => {
    onSelectOption(option);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Thêm vào tủ lạnh</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3 pb-6">
          {/* Manual Add */}
          <button
            onClick={() => handleOptionClick('manual')}
            className="w-full bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-900 mb-1">Thêm thủ công</h4>
              <p className="text-sm text-gray-500">Nhập thông tin món ăn từ bàn phím</p>
            </div>
          </button>

          {/* Barcode Scan */}
          <button
            onClick={() => handleOptionClick('barcode')}
            className="w-full bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Scan className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-900 mb-1">Quét mã vạch</h4>
              <p className="text-sm text-gray-500">Sử dụng camera để quét sản phẩm</p>
            </div>
          </button>

          {/* Custom Item */}
          <button
            onClick={() => handleOptionClick('custom')}
            className="w-full bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-gray-900 mb-1">Tạo món tùy chỉnh</h4>
              <p className="text-sm text-gray-500">Tự tạo món ăn mới với icon riêng</p>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
