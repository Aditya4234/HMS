'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookingAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarCheck, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await bookingAPI.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchBookings();
    } catch {
      toast.error('Failed to update booking');
    }
  };

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
        <Button variant="gradient" className="flex items-center space-x-2">
          <CalendarCheck className="w-4 h-4" />
          <span>New Booking</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
          >
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
                  <p className="text-sm text-gray-400">
                    {booking.user?.fullName || 'Unknown'} • Room {booking.room?.roomNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.guests} guest(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(booking.totalAmount)}</p>
                  <p className="text-xs text-gray-500">{booking.payments?.length || 0} payment(s)</p>
                </div>
                <div className="flex space-x-2">
                  {booking.status === 'CONFIRMED' && (
                    <Button size="sm" variant="outline" className="text-green-400 border-green-500/20 hover:bg-green-500/10 text-xs" onClick={() => updateStatus(booking.id, 'CHECKED_IN')}>
                      Check In
                    </Button>
                  )}
                  {booking.status === 'CHECKED_IN' && (
                    <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/20 hover:bg-blue-500/10 text-xs" onClick={() => updateStatus(booking.id, 'CHECKED_OUT')}>
                      Check Out
                    </Button>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <Button size="sm" variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 text-xs" onClick={() => updateStatus(booking.id, 'CANCELLED')}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
