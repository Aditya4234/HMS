'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paymentAPI, bookingAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Wallet, DollarSign, Coins, Search, Loader2, Plus, X, CheckCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const methodIcons: Record<string, { icon: typeof CreditCard; gradient: string }> = {
  STRIPE: { icon: CreditCard, gradient: 'from-indigo-500 to-purple-500' },
  RAZORPAY: { icon: Wallet, gradient: 'from-blue-500 to-cyan-500' },
  PAYPAL: { icon: DollarSign, gradient: 'from-emerald-500 to-teal-500' },
  CASH: { icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
};

const methodBadgeVariant: Record<string, 'info' | 'warning' | 'success' | 'secondary'> = {
  STRIPE: 'info',
  RAZORPAY: 'warning',
  PAYPAL: 'success',
  CASH: 'secondary',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    bookingId: '', method: 'CASH', amount: '',
  });

  useEffect(() => { fetchPayments(); }, [page]);

  const fetchPayments = async () => {
    try {
      const res = await paymentAPI.getAll({ page, limit: PAGE_SIZE });
      setPayments(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load payments');
    } finally { setLoading(false); }
  };

  const openCreate = async () => {
    try {
      const res = await bookingAPI.getAll({ limit: 100 });
      setBookings(res.data.data || []);
    } catch { setBookings([]); }
    setForm({ bookingId: '', method: 'CASH', amount: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentAPI.create({
        bookingId: form.bookingId,
        method: form.method,
        amount: form.amount ? parseFloat(form.amount) : undefined,
      });
      toast.success('Payment created');
      setShowModal(false);
      fetchPayments();
    } catch { toast.error('Failed to create payment'); }
  };

  const handleConfirm = async (payment: any) => {
    const transactionId = window.prompt('Enter transaction ID (optional):');
    setConfirmingId(payment.id);
    try {
      await paymentAPI.confirm({
        paymentId: payment.id,
        ...(transactionId ? { transactionId } : {}),
      });
      toast.success('Payment confirmed');
      fetchPayments();
    } catch { toast.error('Failed to confirm payment');
    } finally { setConfirmingId(null); }
  };

  const filtered = payments.filter((p) =>
    p.booking?.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
    p.method?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;
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
        <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
      </div>

      <div className="grid gap-4">
        {filtered.map((p, i) => {
          const methodConfig = methodIcons[p.method] || { icon: Coins, gradient: 'from-gray-500 to-gray-600' };
          const MethodIcon = methodConfig.icon;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${methodConfig.gradient} flex items-center justify-center`}>
                    <MethodIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{p.booking?.bookingReference || 'N/A'}</span>
                      <Badge variant={methodBadgeVariant[p.method] || 'secondary'} className="text-[10px]">
                        {p.method}
                      </Badge>
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : p.status === 'PENDING' ? 'warning' : p.status === 'FAILED' ? 'destructive' : 'info'} className="text-[10px]">
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
                  {p.status === 'PENDING' && (
                    <Button size="sm" variant="outline" disabled={confirmingId === p.id}
                      className="text-emerald-400 border-white/10 hover:border-emerald-500/30"
                      onClick={() => handleConfirm(p)}>
                      {confirmingId === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Record Payment</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Booking *</label>
                  <select value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <option value="" className="bg-[#0f172a]">Select booking</option>
                    {bookings.map((b: any) => (
                      <option key={b.id} value={b.id} className="bg-[#0f172a]">{b.bookingReference} - {b.user?.fullName || 'N/A'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Method *</label>
                  <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <option value="CASH" className="bg-[#0f172a]">Cash</option>
                    <option value="STRIPE" className="bg-[#0f172a]">Stripe</option>
                    <option value="RAZORPAY" className="bg-[#0f172a]">Razorpay</option>
                    <option value="PAYPAL" className="bg-[#0f172a]">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Amount</label>
                  <Input type="number" step="0.01" min="0" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="bg-white/[0.02] border-white/10 text-white" placeholder="Leave empty for full remaining amount" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">Record Payment</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
