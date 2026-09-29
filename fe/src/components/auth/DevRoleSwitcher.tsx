import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserCheck, Shield, Hammer, Building2, Eye, EyeOff } from 'lucide-react';

export const DevRoleSwitcher: React.FC = () => {
  const { user, switchDevRole, setForbidden } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const roles = [
    { key: 'CUSTOMER', label: 'Du Khách (Customer)', icon: UserCheck, color: 'hover:bg-blue-50 text-blue-700' },
    { key: 'ARTISAN', label: 'Nghệ Nhân (Artisan)', icon: Hammer, color: 'hover:bg-red-50 text-heritage-red' },
    { key: 'VILLAGE_ADMIN', label: 'Quản Lý Làng', icon: Building2, color: 'hover:bg-amber-50 text-amber-700' },
    { key: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield, color: 'hover:bg-purple-50 text-purple-700' }
  ];

  const currentRole = user?.role || 'CUSTOMER';

  return (
    <aside 
      aria-label="Công cụ chuyển đổi vai trò thử nghiệm"
      className="fixed bottom-4 left-4 z-[9900] bg-white/95 backdrop-blur-md border-2 border-heritage-border rounded-2xl shadow-heritage-modal p-2 text-xs font-sans transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 px-2 py-1 border-b border-gray-100 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-heritage-indigo text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DEV RBAC SWITCHER</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
          title={collapsed ? 'Mở rộng bảng' : 'Thu nhỏ bảng'}
        >
          {collapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="pt-2 flex flex-col gap-1">
          <div className="text-[10px] text-gray-500 px-2 pb-0.5">
            Role hiện tại: <strong className="text-heritage-red font-bold uppercase">{currentRole}</strong>
          </div>
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => {
                    setForbidden(false);
                    switchDevRole(r.key);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-heritage-indigo text-white shadow-sm'
                      : `bg-stone-100 text-stone-700 hover:bg-stone-200 ${r.color}`
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{r.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
