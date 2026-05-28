'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { customerAPI } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const filtered = customers.filter((c) =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-500 text-sm">Manage your guests</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/[0.02] border-white/10 text-white" />
      </div>

      <div className="grid gap-3">
        {filtered.map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
          >
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
              <div className="text-right text-sm text-gray-500">
                <p>{customer._count?.bookings || 0} bookings</p>
                <p>Joined {formatDate(customer.createdAt)}</p>
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
      </div>
    </div>
  );
}
