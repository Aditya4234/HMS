'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { bookingAPI, roomAPI, paymentAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarCheck, X, Search } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function BookingsPage() {
  const { user } = useAuthStore();
  const isStaff = user?.role && user.role !== 'CUSTOMER';
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    roomId: '', checkIn: '', checkOut: '', guests: '1', specialRequests: '',
  });

  useEffect(() => { fetchBookings(); }, [page]);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll({ page, limit: PAGE_SIZE });
      setBookings(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load bookings');
    } finally { setLoading(false); }
  };

  const openCreate = async () => {
    try {
      const res = await roomAPI.getAvailable();
      setRooms(res.data.data || []);
    } catch { setRooms([]); }
    setForm({ roomId: '', checkIn: '', checkOut: '', guests: '1', specialRequests: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookingAPI.create({ ...form, guests: parseInt(form.guests) });
      toast.success('Booking created');
      setShowModal(false);
      fetchBookings();
    } catch { toast.error('Failed to create booking'); }
  };

  const recordCashPayment = async (bookingId: string) => {
    try {
      const res = await paymentAPI.create({ bookingId, method: 'CASH' });
      const payment = res.data.data.payment;
      await paymentAPI.confirm({ paymentId: payment.id });
      toast.success('Cash payment recorded');
      fetchBookings();
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await bookingAPI.updateStatus(id, status);
      toast.success('Booking ' + status.toLowerCase().replace(/_/g, ' '));
      fetchBookings();
    } catch { toast.error('Failed to update booking'); }
  };

  const filtered = bookings.filter((b) =>
    b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-gray-500 text-sm">Manage all reservations</p>
        </div>
        <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
          <CalendarCheck className="w-4 h-4" />
          <span>New Booking</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((booking, i) => (
          <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{booking.bookingReference}</span>
                    <Badge variant={booking.status === 'CONFIRMED' ? 'info' : booking.status === 'CHECKED_IN' ? 'success' : booking.status === 'CANCELLED' ? 'destructive' : 'warning'} className="text-[10px]">
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{booking.user?.fullName || 'Unknown'} • Room {booking.room?.roomNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.guests} guest(s)</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(booking.totalAmount)}</p>
                  <p className="text-xs text-gray-500">{booking.payments?.length || 0} payment(s)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isStaff && (booking.paidAmount ?? 0) < booking.totalAmount && booking.status !== 'CANCELLED' && (
                    <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10 text-xs"
                      onClick={() => recordCashPayment(booking.id)}>Record Cash Pay</Button>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <Button size="sm" variant="outline" className="text-green-400 border-green-500/20 hover:bg-green-500/10 text-xs"
                      onClick={() => updateStatus(booking.id, 'CHECKED_IN')}>Check In</Button>
                  )}
                  {booking.status === 'CHECKED_IN' && (
                    <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/20 hover:bg-blue-500/10 text-xs"
                      onClick={() => updateStatus(booking.id, 'CHECKED_OUT')}>Check Out</Button>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <Button size="sm" variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 text-xs"
                      onClick={() => updateStatus(booking.id, 'CANCELLED')}>Cancel</Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No bookings found</p>
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
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">New Booking</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Room *</label>
                  <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <option value="" className="bg-[#0f172a]">Select room</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id} className="bg-[#0f172a]">Room {r.roomNumber} - {r.roomType} ({formatCurrency(r.pricePerNight)}/night)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Check-in *</label>
                    <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Check-out *</label>
                    <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Guests</label>
                  <Input type="number" min="1" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="bg-white/[0.02] border-white/10 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Special Requests</label>
                  <textarea value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">Create Booking</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
