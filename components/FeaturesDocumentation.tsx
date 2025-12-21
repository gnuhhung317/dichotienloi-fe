import { Check, ArrowLeft } from 'lucide-react';

interface FeaturesDocumentationProps {
  onClose: () => void;
}

export function FeaturesDocumentation({ onClose }: FeaturesDocumentationProps) {
  const features = [
    {
      number: 1,
      title: 'Thêm vào tủ lạnh',
      emoji: '🧊',
      description: 'Nhập thủ công đồ vừa mua hoặc được cho biếu vào tủ lạnh để theo dõi hạn sử dụng.',
      flow: [
        'Bấm nút → Hiện Bottom Sheet (che 70% màn hình)',
        'Nhập tên → App gợi ý (Autocomplete)',
        'Chọn số lượng (nút +/-) & đơn vị tính',
        'Chọn hạn dùng: Chips nhanh (+3 ngày, +1 tuần, +1 tháng) hoặc Date Picker',
        'Chọn vị trí: Ngăn mát, Ngăn đông, Tủ đồ khô',
        'Bấm "Thêm vào tủ"',
      ],
      components: [
        'Bottom Sheet Form với header "Thêm đồ vào tủ"',
        'Input autocomplete với dropdown gợi ý',
        'Quantity input với +/- buttons',
        'Quick date chips + Date Picker',
        'Location selector (3 options)',
        'CTA button màu xanh',
      ],
    },
    {
      number: 2,
      title: 'Quét mã vạch',
      emoji: '📱',
      description: 'Cách nhanh nhất để thêm đồ mà không cần gõ phím.',
      flow: [
        'Bấm nút → Mở Camera toàn màn hình',
        'Quét trúng mã → (Tít!) → Hiện Popup thông tin',
        'Xác nhận hạn sử dụng → Lưu',
      ],
      components: [
        'Màn hình Camera với khung vuông ở giữa',
        'Nút bật Flash (góc trên)',
        'Nút "Nhập mã thủ công"',
        'Modal "Tìm thấy" với ảnh sản phẩm + tên',
        'Modal "Không tìm thấy" với form nhập thủ công',
      ],
    },
    {
      number: 3,
      title: 'Tạo món mới',
      emoji: '✨',
      description: 'Định nghĩa món đồ "đặc biệt" chưa có trong cơ sở dữ liệu chung.',
      flow: [
        'Bấm nút → Mở form tạo món mới',
        'Upload ảnh hoặc chọn Icon đại diện',
        'Nhập tên và chọn danh mục',
        'Set hạn sử dụng mặc định',
        'Sau này khi thêm, App tự điền số này',
      ],
      components: [
        'Upload ảnh: Camera hoặc Gallery',
        'Icon grid: Lưới các icon đồ ăn (Rau, Thịt, Cá...)',
        'Tên hiển thị input',
        'Category dropdown',
        'Default expiry slider (1-365 ngày)',
        'Description textarea (optional)',
      ],
    },
    {
      number: 4,
      title: 'Mời thành viên',
      emoji: '👥',
      description: 'Thêm vợ/chồng/con cái vào cùng quản lý.',
      flow: [
        'Bấm nút → Hiện Modal chia sẻ',
        '2 cách mời: Quét QR hoặc Gửi Link',
        'Người được mời: Xem thông báo → Đồng ý/Từ chối',
      ],
      components: [
        'QR Code lớn ở giữa',
        'Mã Code dạng chữ (VD: GIA-DINH-123) + nút Copy',
        'Nút Share: Zalo/Messenger',
        'Màn hình acceptance cho người được mời',
        'Benefits list (4 items với checkmarks)',
      ],
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Demo
      </button>

      <div className="text-center mb-8">
        <h1 className="text-gray-900 mb-2">📋 Tài liệu 4 tính năng</h1>
        <p className="text-gray-600">
          Documentation cho "Đi Chợ Tiện Lợi" - Smart Grocery Manager
        </p>
      </div>

      {features.map((feature, index) => (
        <div
          key={feature.number}
          className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                {feature.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    Tính năng {feature.number}
                  </span>
                </div>
                <h2 className="mb-1">{feature.title}</h2>
                <p className="text-sm text-green-100">{feature.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* UX Flow */}
            <div>
              <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Luồng hoạt động (UX Flow)
              </h3>
              <div className="space-y-2">
                {feature.flow.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-blue-600 flex-shrink-0">→</span>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* UI Components */}
            <div>
              <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                UI Components cần có
              </h3>
              <div className="grid gap-2">
                {feature.components.map((component, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl"
                  >
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{component}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200">
        <h3 className="text-gray-900 mb-4 text-center">Tổng kết triển khai</h3>
        <div className="space-y-3">
          {[
            {
              label: 'Tổng số tính năng',
              value: '4 features',
              color: 'bg-green-600',
            },
            {
              label: 'Components đã xây dựng',
              value: '8 components',
              color: 'bg-blue-600',
            },
            {
              label: 'Modals/Bottom Sheets',
              value: '5 modals',
              color: 'bg-purple-600',
            },
            {
              label: 'User Flows',
              value: '4 flows',
              color: 'bg-orange-600',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
            >
              <span className="text-sm text-gray-700">{stat.label}</span>
              <span className={`px-4 py-1 ${stat.color} text-white rounded-full text-sm`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
          <p className="text-sm text-center text-gray-700">
            <span className="text-blue-600">💡 Lưu ý:</span> Tất cả components đã được
            thiết kế mobile-first (390x844px) với animations, transitions, và optimistic
            UI patterns sẵn sàng cho Socket.io backend integration.
          </p>
        </div>
      </div>

      {/* Technical Stack Info */}
      <div className="bg-gray-900 text-white rounded-3xl p-6">
        <h3 className="mb-4 text-center">Tech Stack</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            '⚛️ React + TypeScript',
            '🎨 Tailwind CSS',
            '📱 Mobile-first (390x844)',
            '🔄 Bottom Sheet Modals',
            '✨ Autocomplete Input',
            '📸 Camera Integration',
            '📊 QR Code Display',
            '🎯 Icon Grid Selection',
          ].map((tech, i) => (
            <div key={i} className="p-3 bg-white/10 rounded-xl text-center">
              {tech}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}