'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { hotelAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Building2, Search, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function HotelsPage() {
  const { user } = useAuthStore();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await hotelAPI.getAll();
      setHotels(res.data.data || []);
    } catch { toast.error('Failed to load hotels');
    } finally { setLoading(false); }
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
              <div className="text-right text-sm text-gray-400">
                <p>{hotel.email || 'N/A'}</p>
                <p className="text-xs text-gray-500">Tax: {hotel.taxRate}%</p>
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
    </div>
  );
}
