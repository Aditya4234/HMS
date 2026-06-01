'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { staffAPI } from '@/lib/api';
import { Building2, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', position: '', department: '',
    salary: '', gender: 'MALE', address: '', shift: 'MORNING',
  });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data.data);
    } catch { toast.error('Failed to load staff');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ fullName: '', email: '', phoneNumber: '', position: '', department: '', salary: '', gender: 'MALE', address: '', shift: 'MORNING' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffAPI.create({ ...form, salary: form.salary ? parseFloat(form.salary) : undefined });
      toast.success('Staff member created');
      setShowModal(false);
      fetchStaff();
    } catch { toast.error('Failed to create staff member'); }
  };

  const filtered = staff.filter((m) =>
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.position?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-gray-500 text-sm">Manage your team</p>
        </div>
        <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
      </div>

      <div className="grid gap-4">
        {filtered.map((member, i) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{member.fullName}</h3>
                    <Badge variant={member.isActive ? 'success' : 'destructive'} className="text-[10px]">
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{member.position} • {member.department}</p>
                  <p className="text-xs text-gray-500">ID: {member.employeeId}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>{member.email}</p>
                {member.salary && <p>${member.salary.toLocaleString()}/yr</p>}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No staff members found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Staff</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Full Name *</label>
                    <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email *</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                    <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Position *</label>
                    <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Department *</label>
                    <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Salary</label>
                    <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="MALE" className="bg-[#0f172a]">Male</option>
                      <option value="FEMALE" className="bg-[#0f172a]">Female</option>
                      <option value="OTHER" className="bg-[#0f172a]">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Shift</label>
                    <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="MORNING" className="bg-[#0f172a]">Morning</option>
                      <option value="AFTERNOON" className="bg-[#0f172a]">Afternoon</option>
                      <option value="NIGHT" className="bg-[#0f172a]">Night</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">Create Staff</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
