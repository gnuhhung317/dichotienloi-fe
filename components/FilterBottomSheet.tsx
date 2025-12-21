import { X } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  sortBy: 'newest' | 'expiring' | 'name';
  location: 'all' | 'cooler' | 'freezer' | 'pantry';
  status: 'available' | 'expiring' | 'expired';
}

export function FilterBottomSheet({ isOpen, onClose, onApply }: FilterBottomSheetProps) {
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>('newest');
  const [location, setLocation] = useState<FilterState['location']>('all');
  const [status, setStatus] = useState<FilterState['status']>('available');

  if (!isOpen) return null;

  const handleReset = () => {
    setSortBy('newest');
    setLocation('all');
    setStatus('available');
  };

  const handleApply = () => {
    onApply({ sortBy, location, status });
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
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up max-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Bộ lọc</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sort By */}
          <div>
            <h4 className="text-sm text-gray-700 mb-3">Sắp xếp theo</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => setSortBy('expiring')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  sortBy === 'expiring'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hết hạn sớm nhất
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  sortBy === 'name'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tên (A-Z)
              </button>
            </div>
          </div>

          {/* Storage Location */}
          <div>
            <h4 className="text-sm text-gray-700 mb-3">Vị trí lưu trữ</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocation('all')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  location === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setLocation('cooler')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  location === 'cooler'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ❄️ Ngăn mát
              </button>
              <button
                onClick={() => setLocation('freezer')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  location === 'freezer'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🧊 Ngăn đông
              </button>
              <button
                onClick={() => setLocation('pantry')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  location === 'pantry'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏪 Tủ đồ khô
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm text-gray-700 mb-3">Trạng thái</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatus('available')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  status === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Còn hàng
              </button>
              <button
                onClick={() => setStatus('expiring')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  status === 'expiring'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚠️ Sắp hết hạn (&lt; 3 ngày)
              </button>
              <button
                onClick={() => setStatus('expired')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  status === 'expired'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔴 Đã hết hạn
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Áp dụng
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

import { useState } from 'react';
