'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { invoiceAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll();
      setInvoices(res.data.data);
    } catch { toast.error('Failed to load invoices');
    } finally { setLoading(false); }
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
      <div>
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-gray-500 text-sm">View and manage invoices</p>
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
                <button aria-label="Download invoice" onClick={() => {
                  if (inv.pdfUrl) window.open(inv.pdfUrl, '_blank');
                  else toast.error('No PDF available');
                }} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
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
      </div>
    </div>
  );
}
