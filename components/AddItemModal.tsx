import { X, Camera, Calendar } from 'lucide-react';

interface AddItemModalProps {
  onClose: () => void;
  type: 'fridge' | 'shopping';
}

export function AddItemModal({ onClose, type }: AddItemModalProps) {
  const categories = [
    { id: 'vegetables', label: 'Rau củ', icon: '🥬' },
    { id: 'meat', label: 'Thịt', icon: '🥩' },
    { id: 'dairy', label: 'Sữa', icon: '🥛' },
    { id: 'frozen', label: 'Đông lạnh', icon: '❄️' },
    { id: 'bakery', label: 'Bánh', icon: '🍞' },
    { id: 'other', label: 'Khác', icon: '📦' },
  ];

  const units = ['kg', 'g', 'l', 'ml', 'quả', 'hộp', 'gói', 'bó'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg text-gray-900">
            {type === 'fridge' ? 'Thêm vào tủ lạnh' : 'Thêm vào danh sách'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Hình ảnh</label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1 text-sm text-gray-500">
                <p>Chụp ảnh hoặc chọn từ thư viện</p>
              </div>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Tên món *</label>
            <input
              type="text"
              placeholder="VD: Cà chua, Sữa tươi..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            {/* Auto-complete suggestions could appear here */}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Danh mục *</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="flex flex-col items-center gap-1 p-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs text-gray-700">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Số lượng *</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                defaultValue="1"
              />
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiration Date (Only for Fridge) */}
          {type === 'fridge' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Ngày hết hạn</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Storage Location (Only for Fridge) */}
          {type === 'fridge' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Vị trí lưu trữ</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-sm">
                  Ngăn mát
                </button>
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-sm">
                  Ngăn đá
                </button>
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-sm">
                  Tủ khô
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
            <textarea
              placeholder="Thêm ghi chú..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
