'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { paymentAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, statsRes] = await Promise.all([
          paymentAPI.getAll(),
          paymentAPI.getStats(),
        ]);
        setPayments(payRes.data.data);
        setStats(statsRes.data.data);
      } catch { toast.error('Failed to load payments'); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-500 text-sm">Track all transactions</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-xl font-bold text-green-400">{stats.completedPayments}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-400">{stats.pendingPayments}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3">
        {payments.map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
                    <Badge variant={payment.status === 'COMPLETED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'destructive'} className="text-[10px]">
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{payment.method} • {payment.booking?.bookingReference || 'N/A'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
            </div>
          </motion.div>
        ))}
        {payments.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
