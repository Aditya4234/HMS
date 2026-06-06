'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api, { customerAPI } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { Search, Plus, X, Users, Mail, Phone } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '',
  });

  useEffect(() => { fetchCustomers(); }, [page]);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ page, limit: PAGE_SIZE });
      setCustomers(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load customers');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (customer: any) => {
    setEditingCustomer(customer);
    setForm({
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const { password, ...data } = form;
        await customerAPI.update(editingCustomer.id, data);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer created');
      }
      setShowModal(false);
      fetchCustomers();
    } catch { toast.error('Failed to save customer'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await customerAPI.delete(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch { toast.error('Failed to delete customer'); }
  };

  const filtered = customers.filter((c) =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4">
      <div className="h-10 w-48 rounded-xl bg-white/[0.02] animate-pulse" />
      <div className="grid gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-500 text-sm">Manage your guests</p>
        </div>
        <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
      </div>

      <div className="grid gap-4">
        {filtered.map((customer, i) => (
          <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400">
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{customer.fullName}</h3>
                    <Badge variant={customer.isActive ? 'success' : 'destructive'} className="text-[10px]">
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center"><Mail className="w-3 h-3 mr-1" />{customer.email}</span>
                    {customer.phoneNumber && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{customer.phoneNumber}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right text-sm text-gray-500">
                  <p>{customer._count?.bookings || 0} bookings</p>
                  <p>Joined {formatDate(customer.createdAt)}</p>
                </div>
                <button aria-label="Edit customer" onClick={() => openEdit(customer)}
                  className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button aria-label="Delete customer" onClick={() => handleDelete(customer.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No customers found</p>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
                <h2 className="text-xl font-bold text-white">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
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
                  {!editingCustomer && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Password *</label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="bg-white/[0.02] border-white/10 text-white" required />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">{editingCustomer ? 'Update Customer' : 'Create Customer'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
