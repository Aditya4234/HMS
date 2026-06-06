'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { hotelAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Building2, Search, Star, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function HotelsPage() {
  const { user } = useAuthStore();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', description: '', email: '', phone: '', address: '', city: '', state: '', country: '',
    zipCode: '', currency: 'USD', timezone: 'UTC', taxRate: '0',
  });

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await hotelAPI.getAll();
      setHotels(res.data.data || []);
    } catch { toast.error('Failed to load hotels');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ name: '', description: '', email: '', phone: '', address: '', city: '', state: '', country: '',
      zipCode: '', currency: 'USD', timezone: 'UTC', taxRate: '0' });
    setEditingHotel(null);
    setShowModal(true);
  };

  const handleEdit = (hotel: any) => {
    setForm({
      name: hotel.name || '',
      description: hotel.description || '',
      email: hotel.email || '',
      phone: hotel.phone || '',
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      country: hotel.country || '',
      zipCode: hotel.zipCode || '',
      currency: hotel.currency || 'USD',
      timezone: hotel.timezone || 'UTC',
      taxRate: hotel.taxRate?.toString() || '0',
    });
    setEditingHotel(hotel);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        zipCode: form.zipCode || undefined,
        currency: form.currency,
        timezone: form.timezone,
        taxRate: parseFloat(form.taxRate) || 0,
      };
      if (editingHotel) {
        await hotelAPI.update({ ...data, id: editingHotel.id });
        toast.success('Hotel updated');
      } else {
        await hotelAPI.create(data);
        toast.success('Hotel created');
      }
      setShowModal(false);
      setEditingHotel(null);
      fetchHotels();
    } catch { toast.error(editingHotel ? 'Failed to update hotel' : 'Failed to create hotel'); }
  };

  const handleDelete = async (hotel: any) => {
    if (!window.confirm(`Are you sure you want to delete ${hotel.name}?`)) return;
    try {
      await hotelAPI.delete(hotel.id);
      toast.success('Hotel deleted');
      fetchHotels();
    } catch { toast.error('Failed to delete hotel'); }
  };

  const filtered = hotels.filter((h) =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hotels</h1>
          <p className="text-gray-500 text-sm">Manage all hotels in the system</p>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Add Hotel</span>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search hotels..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white" />
      </div>

      <div className="grid gap-4">
        {filtered.map((hotel, i) => (
          <motion.div key={hotel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{hotel.name}</h3>
                    <Badge variant={hotel.isActive ? 'success' : 'destructive'} className="text-[10px]">
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {hotel.city ? `${hotel.city}, ` : ''}{hotel.country || ''}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Star className="w-3 h-3 text-amber-400 mr-1" />
                    {hotel.rating ? `${hotel.rating}/5` : 'No rating'}
                    <span className="mx-2">•</span>
                    {hotel.currency} • {hotel.timezone}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user?.role === 'SUPER_ADMIN' && (
                  <>
                    <Button size="sm" variant="outline" className="text-gray-400 border-white/10" onClick={() => handleEdit(hotel)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-400 border-white/10 hover:border-red-500/30"
                      onClick={() => handleDelete(hotel)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <div className="text-right text-sm text-gray-400">
                  <p>{hotel.email || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Tax: {hotel.taxRate}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hotels found</p>
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
                <h2 className="text-xl font-bold text-white">{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-white/[0.02] border-white/10 text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">Address</label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">City</label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">State</label>
                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Country</label>
                    <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Zip Code</label>
                    <Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Currency</label>
                    <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option className="bg-[#0f172a]" value="USD">USD</option>
                      <option className="bg-[#0f172a]" value="EUR">EUR</option>
                      <option className="bg-[#0f172a]" value="GBP">GBP</option>
                      <option className="bg-[#0f172a]" value="INR">INR</option>
                      <option className="bg-[#0f172a]" value="AUD">AUD</option>
                      <option className="bg-[#0f172a]" value="CAD">CAD</option>
                      <option className="bg-[#0f172a]" value="JPY">JPY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Timezone</label>
                    <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Tax Rate (%)</label>
                    <Input type="number" step="0.1" min="0" value={form.taxRate}
                      onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">{editingHotel ? 'Update Hotel' : 'Create Hotel'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
