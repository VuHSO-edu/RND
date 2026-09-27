import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { UserDto, CreateUserRequest, fetchUsers, createUser, deleteUser } from '../../../services/userApi';
import { OrgUnit } from '../../../services/gisApi';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgUnits?: OrgUnit[];
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  orgUnits = []
}) => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [password, setPassword] = useState('HeritageUser@2026');

  const loadUserList = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({ size: 50 });
      setUsers(res.content);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserList();
      setShowAddForm(false);
      setMsg(null);
      if (orgUnits.length > 0) {
        setUnitCode(orgUnits[0].code);
      }
    }
  }, [isOpen, orgUnits]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    if (!cleanUsername) {
      setMsg({ type: 'error', text: 'Tên đăng nhập không được để trống' });
      return;
    }
    if (!cleanFullName) {
      setMsg({ type: 'error', text: 'Họ và tên không được để trống' });
      return;
    }
    if (!cleanEmail) {
      setMsg({ type: 'error', text: 'Email không được để trống' });
      return;
    }

    try {
      setLoading(true);
      const selectedUnit = orgUnits.find((u) => u.code === unitCode);
      await createUser({
        username: cleanUsername,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: phone.trim(),
        unitCode,
        unitName: selectedUnit ? selectedUnit.name : undefined,
        role,
        password: password.trim()
      });

      setMsg({ type: 'success', text: `Tạo người dùng [${cleanUsername}] thành công!` });
      setShowAddForm(false);
      // Reset form
      setUsername('');
      setFullName('');
      setEmail('');
      setPhone('');
      loadUserList();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Lỗi khi tạo người dùng' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng [${name}] không?`)) {
      try {
        await deleteUser(id);
        setMsg({ type: 'success', text: 'Đã xóa người dùng thành công' });
        loadUserList();
      } catch (err: any) {
        setMsg({ type: 'error', text: 'Lỗi khi xóa người dùng' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
        style={{ fontFamily: 'Tahoma, sans-serif' }}
      >
        {/* Header 56px */}
        <div className="h-14 px-6 bg-[#1677ff] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">BHTT</span>
            <span className="text-white/60">•</span>
            <h3 className="font-bold text-sm">QUẢN LÝ NGƯỜI DÙNG &amp; PHÂN QUYỀN HỆ THỐNG</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo Alert */}
        {msg && (
          <div className={`p-3 text-xs flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-200' : 'bg-red-50 text-red-600 border-b border-red-200'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Toolbar & Nút thêm mới */}
        <div className="p-4 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between shrink-0 text-[13px]">
          <span className="font-bold text-black">
            Danh sách tài khoản ({users.length})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-1.5 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showAddForm ? 'ĐÓNG FORM NHẬP' : '+ THÊM NGƯỜI DÙNG MỚI'}
          </button>
        </div>

        {/* Form thêm mới (Hiện khi bấm + Thêm người dùng) */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="p-5 bg-blue-50/50 border-b border-blue-100 text-[13px] space-y-3 shrink-0">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="VD: operator_01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="VD: nva@npc.com.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-black font-semibold mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0988123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Đơn vị công tác</label>
                <select
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                >
                  {orgUnits.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Vai trò</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                >
                  <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="ROLE_DISPATCHER">Điều độ viên</option>
                  <option value="ROLE_OPERATOR">Vận hành viên</option>
                  <option value="ROLE_USER">Người dùng (CLIENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-white text-[#1677ff] focus:outline-none focus:ring-1 focus:ring-[#1677ff]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
              >
                HỦY
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                LƯU DỮ LIỆU
              </button>
            </div>
          </form>
        )}

        {/* Bảng danh sách người dùng */}
        <div className="flex-1 overflow-y-auto p-4 text-[13px]">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-black text-left text-xs uppercase">
                <th className="border p-2.5 w-12 text-center">STT</th>
                <th className="border p-2.5">Tên đăng nhập</th>
                <th className="border p-2.5">Họ và tên</th>
                <th className="border p-2.5">Email</th>
                <th className="border p-2.5">Đơn vị</th>
                <th className="border p-2.5">Vai trò</th>
                <th className="border p-2.5">Trạng thái</th>
                <th className="border p-2.5 w-16 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors border-b">
                  <td className="border p-2 text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="border p-2 font-bold text-[#1677ff]">{u.username || 'admin_gis'}</td>
                  <td className="border p-2 font-semibold text-black">{u.fullName}</td>
                  <td className="border p-2 text-gray-600">{u.email}</td>
                  <td className="border p-2 text-gray-700">{u.unitCode ? `${u.unitCode} - ${u.unitName || ''}` : 'F01'}</td>
                  <td className="border p-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                      {u.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {u.status}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDelete(u.id, u.fullName)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-[13px] transition-colors"
          >
            THOÁT
          </button>
        </div>
      </div>
    </div>
  );
};
