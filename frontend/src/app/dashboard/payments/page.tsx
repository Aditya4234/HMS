'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { paymentAPI, bookingAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, X, CreditCard, DollarSign, CheckCircle, Edit, Trash2, Loader2, Coins } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const methodBadgeClass: Record<string, string> = {
  STRIPE: 'bg-blue-500/20 text-blue-400',
  RAZORPAY: 'bg-orange-500/20 text-orange-400',
  PAYPAL: 'bg-cyan-500/20 text-cyan-400',
  CASH: 'bg-green-500/20 text-green-400',
  CARD: 'bg-purple-500/20 text-purple-400',
};

const methodIcon: Record<string, typeof CreditCard> = {
  STRIPE: CreditCard,
  RAZORPAY: DollarSign,
  PAYPAL: DollarSign,
  CASH: DollarSign,
  CARD: CreditCard,
};

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'HOTEL_ADMIN';

  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [form, setForm] = useState({
    bookingId: '', method: 'CASH', amount: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState<any>(null);
  const [confirmTransactionId, setConfirmTransactionId] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { fetchPayments(); }, [page]);

  const fetchPayments = async () => {
    try {
      const res = await paymentAPI.getAll({ page, limit: PAGE_SIZE });
      setPayments(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = async () => {
    try {
      const res = await bookingAPI.getAll({ limit: 100 });
      setBookings(res.data.data || []);
    } catch {
      setBookings([]);
    }
    setEditingPayment(null);
    setForm({ bookingId: '', method: 'CASH', amount: '' });
    setShowModal(true);
  };

  const openEdit = async (payment: any) => {
    try {
      const res = await bookingAPI.getAll({ limit: 100 });
      setBookings(res.data.data || []);
    } catch {
      setBookings([]);
    }
    setEditingPayment(payment);
    setForm({
      bookingId: payment.bookingId || payment.booking?.id || '',
      method: payment.method,
      amount: payment.amount?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        bookingId: form.bookingId,
        method: form.method,
      };
      if (form.amount) data.amount = parseFloat(form.amount);

      if (editingPayment) {
        await paymentAPI.update(editingPayment.id, data);
        toast.success('Payment updated');
      } else {
        await paymentAPI.create(data);
        toast.success('Payment created');
      }
      setShowModal(false);
      setEditingPayment(null);
      fetchPayments();
    } catch {
      toast.error(editingPayment ? 'Failed to update payment' : 'Failed to create payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await paymentAPI.delete(id);
      toast.success('Payment deleted');
      fetchPayments();
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const handleConfirmClick = (payment: any) => {
    setConfirmPayment(payment);
    setConfirmTransactionId('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!confirmPayment) return;
    setConfirming(true);
    try {
      await paymentAPI.confirm({
        bookingId: confirmPayment.bookingId,
        amount: confirmPayment.amount,
        transactionId: confirmTransactionId || undefined,
      });
      toast.success('Payment confirmed');
      setShowConfirmModal(false);
      setConfirmPayment(null);
      setConfirmTransactionId('');
      fetchPayments();
    } catch {
      toast.error('Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = payments.filter((p) =>
    p.booking?.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
    p.method?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-xl bg-white/[0.02] animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-500 text-sm">View and manage payments</p>
        </div>
        <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((p, i) => {
          const Icon = methodIcon[p.method] || Coins;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{p.booking?.bookingReference || 'N/A'}</span>
                      <Badge className={`text-[10px] ${methodBadgeClass[p.method] || 'bg-gray-500/20 text-gray-400'}`}>
                        {p.method}
                      </Badge>
                      <Badge
                        variant={p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'warning' : p.status === 'FAILED' ? 'destructive' : 'info'}
                        className="text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {p.transactionId ? `TX: ${p.transactionId}` : 'No transaction ID'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatCurrency(p.amount)}</p>
                  </div>
                  {isAdmin && (
                    <>
                      <button
                        aria-label="Edit payment"
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Delete payment"
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {p.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-400 border-white/10 hover:border-emerald-500/30"
                      onClick={() => handleConfirmClick(p)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payments found</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingPayment ? 'Edit Payment' : 'Record Payment'}</h2>
                <button
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Booking *</label>
                  <select
                    value={form.bookingId}
                    onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="" className="bg-[#0f172a]">Select booking</option>
                    {bookings.map((b: any) => (
                      <option key={b.id} value={b.id} className="bg-[#0f172a]">
                        {b.bookingReference} - {b.user?.fullName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Method *</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="CASH" className="bg-[#0f172a]">Cash</option>
                    <option value="STRIPE" className="bg-[#0f172a]">Stripe</option>
                    <option value="RAZORPAY" className="bg-[#0f172a]">Razorpay</option>
                    <option value="PAYPAL" className="bg-[#0f172a]">PayPal</option>
                    <option value="CARD" className="bg-[#0f172a]">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="bg-white/[0.02] border-white/10 text-white"
                    placeholder="Leave empty for full remaining amount"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-white border-white/20"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" className="flex-1">
                    {editingPayment ? 'Update Payment' : 'Record Payment'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && confirmPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { if (!confirming) setShowConfirmModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
                <button
                  aria-label="Close"
                  onClick={() => { if (!confirming) setShowConfirmModal(false); }}
                  className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Confirm payment for <span className="text-white font-semibold">{confirmPayment.booking?.bookingReference || 'N/A'}</span> of <span className="text-white font-semibold">{formatCurrency(confirmPayment.amount)}</span>
                </p>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Transaction ID</label>
                  <Input
                    value={confirmTransactionId}
                    onChange={(e) => setConfirmTransactionId(e.target.value)}
                    className="bg-white/[0.02] border-white/10 text-white"
                    placeholder="Enter transaction ID (optional)"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-white border-white/20"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={confirming}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={handleConfirmSubmit}
                    disabled={confirming}
                  >
                    {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
