'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { roomAPI, bookingAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RoomImage } from '@/components/ui/room-image';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Bed, Users, MapPin, ArrowLeft, CalendarCheck,
  Star, CheckCircle, Loader2, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const res = await roomAPI.getPublic(id);
      setRoom(res.data.data);
    } catch {
      toast.error('Room not found');
      router.push('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/rooms/${id}`);
      return;
    }
    setBooking(true);
    try {
      await bookingAPI.create({
        roomId: id,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        specialRequests,
      });
      toast.success('Booking created successfully!');
      router.push('/dashboard/bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  const amenities = room.amenities || [];

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/rooms" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to rooms
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="h-64 md:h-80 rounded-2xl relative overflow-hidden">
                  <RoomImage
                    src={room.images?.[0]}
                    alt={`Room ${room.roomNumber}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">Room {room.roomNumber}</h1>
                      <Badge variant="premium">{room.roomType}</Badge>
                    </div>
                    <p className="text-gray-400">{room.description || 'No description available'}</p>
                    {room.hotel && (
                      <p className="text-sm text-gray-500 flex items-center mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {room.hotel.name}{room.hotel.city ? `, ${room.hotel.city}` : ''}{room.hotel.country ? `, ${room.hotel.country}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{formatCurrency(room.pricePerNight)}</p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { icon: Bed, label: 'Beds', value: `${room.beds} Bed(s)` },
                    { icon: Users, label: 'Capacity', value: `Up to ${room.capacity}` },
                    { icon: 'square', label: 'Size', value: room.size ? `${room.size} sq ft` : 'N/A' },
                    { icon: 'floor', label: 'Floor', value: room.floor ? `Floor ${room.floor}` : 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {amenities.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 mr-2" /> {a}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {room.bookings && room.bookings.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-xl font-bold text-white mb-4">Recent Bookings</h2>
                  <div className="space-y-3">
                    {room.bookings.slice(0, 5).map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-sm text-white font-medium">{b.user?.fullName || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{formatDate(b.checkIn)} - {formatDate(b.checkOut)}</p>
                        </div>
                        <Badge variant={b.status === 'CONFIRMED' ? 'info' : b.status === 'CHECKED_IN' ? 'success' : 'warning'} className="text-[10px]">
                          {b.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="sticky top-28">
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Book This Room</h2>
                    <p className="text-sm text-gray-400 mt-1">Reserve your stay</p>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Check-in *</label>
                        <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                          className="bg-white/[0.02] border-white/10 text-white text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Check-out *</label>
                        <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                          className="bg-white/[0.02] border-white/10 text-white text-sm" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Guests</label>
                      <Input type="number" min="1" max={room.capacity || 10} value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="bg-white/[0.02] border-white/10 text-white text-sm" />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Special Requests</label>
                      <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-3 py-2.5 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <Button type="submit" variant="gradient" className="w-full" disabled={booking}>
                      {booking ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CalendarCheck className="w-4 h-4 mr-2" />
                      )}
                      {isAuthenticated ? 'Book Now' : 'Sign In to Book'}
                    </Button>
                  </form>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price per night</span>
                      <span className="text-white font-medium">{formatCurrency(room.pricePerNight)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Capacity</span>
                      <span className="text-white">Up to {room.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                      <Shield className="w-3 h-3" />
                      Secure booking • Best rate guaranteed
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
