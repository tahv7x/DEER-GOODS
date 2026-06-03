import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Users, User as UserIcon, ChevronDown, Mail } from 'lucide-react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  avatar_url?: string; 
  createdAt?: string;
}

const serif = "'Cormorant Garamond', Georgia, serif";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminCustomers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own role.");
      return;
    }
    
    setUpdatingId(userId);
    try {
      await apiClient.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      console.error("Erreur update role:", error);
      alert(error.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="text-[#1C1712] w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1712] mb-1.5 leading-[1.1]" style={{ fontFamily: serif }}>
            Customers & Staff
          </h1>
          <p className="text-sm text-[#9C8E80]">
            Manage user accounts, view details, and assign admin privileges.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C8E80]" />
          <input 
            type="text" placeholder="Search name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full py-3 pr-4 pl-[42px] rounded-xl border border-[#E5E0D8] bg-white text-sm outline-none transition-all focus:border-[#C4B08A] focus:shadow-[0_0_0_3px_rgba(196,99,28,0.05)]" 
          />
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white border border-[#E5E0D8] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(28,23,18,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E0D8]">
              <tr>
                <th className="px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em]">User</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em]">Contact</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em]">Joined</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-xs font-bold text-[#A89B8C] uppercase tracking-[0.12em] text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 size={28} color="#C4631C" className="animate-spin mx-auto block" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Users size={36} className="text-[#D4C5B0] mx-auto mb-4 block" />
                    <p className="text-[15px] text-[#A89B8C]">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const displayAvatar = u.avatar || u.avatar_url;
                  const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase();

                  return (
                    <motion.tr 
                      key={u.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#F5F1EC] hover:bg-[#FAFAF8] transition-colors"
                    >
                      
                      {/* User Info (Avatar + Name) */}
                      <td className="px-5 py-4 md:px-8 md:py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-[15px] font-bold overflow-hidden shrink-0 ${u.role === 'ADMIN' ? 'bg-[#1C1712] text-[#FDFCF9]' : 'bg-[#F0EBE2] text-[#C4631C]'}`}>
                            {displayAvatar ? (
                              <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{firstLetter}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] md:text-[15px] font-bold text-[#1C1712] flex items-center gap-2">
                              {u.name || 'User'} 
                              {u.id === currentUser?.id && (
                                <span className="text-[9px] bg-[#E5F0FF] text-[#2B6CB0] px-1.5 py-0.5 rounded tracking-wider font-bold">YOU</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 md:px-8 md:py-5">
                        <div className="flex items-center gap-2 text-[13px] md:text-sm text-[#6B5F52]">
                          <Mail size={14} className="text-[#9C8E80]" /> {u.email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 md:px-8 md:py-5 text-[13px] md:text-sm text-[#6B5F52]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Role Dropdown - SIMPLIFIED STYLE */}
                      <td className="px-5 py-4 md:px-8 md:py-5 text-right">
                        <div className="inline-flex items-center relative">
                          {updatingId === u.id ? (
                            <div className="px-4 py-2 flex justify-center w-[110px]">
                              <Loader2 size={16} color="#C4631C" className="animate-spin" />
                            </div>
                          ) : (
                            <div className="relative group">
                              <select 
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === currentUser?.id}
                                className={`appearance-none pl-4 pr-9 py-2.5 rounded-xl text-[11px] font-bold tracking-[0.08em] uppercase outline-none transition-all
                                  ${u.id === currentUser?.id 
                                    ? 'bg-[#FAFAF8] text-[#9C8E80] border border-[#E5E0D8] cursor-not-allowed' 
                                    : 'bg-white border border-[#E5E0D8] text-[#1C1712] cursor-pointer hover:bg-[#C4631C] hover:border-[#C4631C] hover:text-white'}
                                `}
                              >
                                {/* bg-white on options to prevent them from taking the orange background when opened */}
                                <option value="CUSTOMER" className="bg-white text-[#1C1712]">CUSTOMER</option>
                                <option value="ADMIN" className="bg-white text-[#1C1712]">ADMIN</option>
                              </select>
                              <ChevronDown 
                                size={14} 
                                className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors 
                                  ${u.id === currentUser?.id ? 'text-[#9C8E80]' : 'text-[#9C8E80] group-hover:text-white'}
                                `} 
                              />
                            </div>
                          )}
                        </div>
                      </td>

                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 md:px-8 bg-[#FAFAF8] border-t border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs md:text-[13px] text-[#A89B8C]">
              Showing <span className="text-[#1C1712] font-bold">{filteredUsers.length}</span> of <span className="text-[#1C1712] font-bold">{users.length}</span> users
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[11px] text-[#C4631C] font-bold bg-transparent border-none tracking-[0.1em] uppercase hover:underline self-start sm:self-auto">
                Clear search
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCustomers;