'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { invoiceAPI, bookingAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { FileText, Search, Download, Loader2, Plus, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'HOTEL_ADMIN';
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState({
    bookingId: '', amount: '', taxAmount: '0', totalAmount: '', dueDate: '', notes: '',
  });

  useEffect(() => { fetchInvoices(); }, [page]);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll({ page, limit: PAGE_SIZE });
      setInvoices(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load invoices');
    } finally { setLoading(false); }
  };

  const openCreate = async () => {
    try {
      const res = await bookingAPI.getAll({ limit: 100 });
      setBookings(res.data.data || []);
    } catch { setBookings([]); }
    setForm({ bookingId: '', amount: '', taxAmount: '0', totalAmount: '', dueDate: '', notes: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoiceAPI.create({
        bookingId: form.bookingId,
        amount: parseFloat(form.amount),
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : 0,
        totalAmount: parseFloat(form.totalAmount),
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      });
      toast.success('Invoice created');
      setShowModal(false);
      fetchInvoices();
    } catch { toast.error('Failed to create invoice'); }
  };

  const handleDownload = async (inv: any) => {
    if (inv.pdfUrl) {
      window.open(inv.pdfUrl, '_blank');
      return;
    }
    setDownloadingId(inv.id);
    try {
      const res = await invoiceAPI.getById(inv.id);
      const data = res.data.data;
      const blob = new Blob([JSON.stringify({
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        status: data.status,
        bookingRef: data.booking?.bookingReference,
        customerName: data.booking?.user?.fullName,
        date: data.createdAt,
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.invoiceNumber}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = invoices.filter((inv) =>
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.booking?.bookingReference?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-gray-500 text-sm">View and manage invoices</p>
        </div>
        {isAdmin && (
          <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
      </div>

      <div className="grid gap-4">
        {filtered.map((inv, i) => (
          <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{inv.invoiceNumber}</span>
                    <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PENDING' ? 'warning' : 'destructive'} className="text-[10px]">
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {inv.booking?.bookingReference || 'N/A'} • {inv.booking?.user?.fullName || ''}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(inv.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(inv.totalAmount)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={downloadingId === inv.id}
                  className="text-gray-400 border-white/10"
                  onClick={() => handleDownload(inv)}
                >
                  {downloadingId === inv.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No invoices found</p>
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
                <h2 className="text-xl font-bold text-white">Generate Invoice</h2>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Amount *</label>
                    <Input type="number" step="0.01" min="0" value={form.amount}
                      onChange={(e) => {
                        const amt = e.target.value;
                        const tax = parseFloat(form.taxAmount || '0');
                        setForm({ ...form, amount: amt, totalAmount: amt ? (parseFloat(amt) + tax).toString() : '' });
                      }}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Tax Amount</label>
                    <Input type="number" step="0.01" min="0" value={form.taxAmount}
                      onChange={(e) => {
                        const tax = e.target.value;
                        const amt = parseFloat(form.amount || '0');
                        setForm({ ...form, taxAmount: tax, totalAmount: tax ? (amt + parseFloat(tax)).toString() : form.amount });
                      }}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Total Amount *</label>
                    <Input type="number" step="0.01" min="0" value={form.totalAmount}
                      onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Due Date *</label>
                    <Input type="date" value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">Create Invoice</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
