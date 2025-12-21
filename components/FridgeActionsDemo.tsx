import { useState } from 'react';
import { Plus, Scan, Sparkles, UserPlus, X, FileText } from 'lucide-react';
import { AddToFridgeModal } from './AddToFridgeModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CreateCustomItemModal } from './CreateCustomItemModal';
import { InviteMemberModal } from './InviteMemberModal';
import { FeaturesDocumentation } from './FeaturesDocumentation';

export function FridgeActionsDemo() {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'addFridge' | 'scanner' | 'customItem' | 'invite' | null
  >(null);
  const [showDocs, setShowDocs] = useState(false);

  const actions = [
    {
      id: 'addFridge' as const,
      label: 'Thêm vào tủ lạnh',
      icon: Plus,
      color: 'bg-green-600',
      description: 'Nhập thủ công đồ ăn',
    },
    {
      id: 'scanner' as const,
      label: 'Quét mã vạch',
      icon: Scan,
      color: 'bg-blue-600',
      description: 'Tự động thêm từ mã',
    },
    {
      id: 'customItem' as const,
      label: 'Tạo món mới',
      icon: Sparkles,
      color: 'bg-purple-600',
      description: 'Định nghĩa món đặc biệt',
    },
    {
      id: 'invite' as const,
      label: 'Mời thành viên',
      icon: UserPlus,
      color: 'bg-orange-600',
      description: 'Thêm người vào nhóm',
    },
  ];

  const handleActionClick = (actionId: typeof activeModal) => {
    setShowActionsMenu(false);
    setTimeout(() => {
      setActiveModal(actionId);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* View Switcher */}
      {!showDocs ? (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-gray-900 mb-2">🛒 Đi Chợ Tiện Lợi</h1>
            <p className="text-gray-600">Demo 4 tính năng chính</p>
            <button
              onClick={() => setShowDocs(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              Xem tài liệu
            </button>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105 border border-gray-200 group"
                >
                  <div
                    className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </button>
              );
            })}
          </div>

          {/* Feature List */}
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <h3 className="text-gray-900 text-center">Các tính năng đã xây dựng</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div key={action.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <h4 className="text-sm text-gray-900">{action.label}</h4>
                        </div>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="max-w-md mx-auto mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 text-center">
              💡 Bấm vào các nút trên để xem demo từng tính năng
            </p>
          </div>

          {/* Floating Action Button Alternative */}
          <button
            onClick={() => setShowActionsMenu(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-40"
          >
            <Plus className="w-8 h-8" />
          </button>

          {/* Actions Menu Sheet */}
          {showActionsMenu && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
              <div className="bg-white rounded-t-3xl w-full max-w-[390px] pb-8 animate-slide-up">
                <div className="p-4 flex items-center justify-between border-b border-gray-200">
                  <h3 className="text-gray-900">Chọn hành động</h3>
                  <button
                    onClick={() => setShowActionsMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-sm text-gray-900">{action.label}</h4>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          {activeModal === 'addFridge' && (
            <AddToFridgeModal onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'scanner' && (
            <BarcodeScannerModal onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'customItem' && (
            <CreateCustomItemModal onClose={() => setActiveModal(null)} />
          )}
          {activeModal === 'invite' && (
            <InviteMemberModal onClose={() => setActiveModal(null)} />
          )}
        </>
      ) : (
        <FeaturesDocumentation onClose={() => setShowDocs(false)} />
      )}
    </div>
  );
}