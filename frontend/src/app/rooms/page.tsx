'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { roomAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import {
  Bed, Users, Search, MapPin, Wifi, Percent,
  ArrowRight, SlidersHorizontal, X, Loader2, ImageIcon
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const roomTypes = ['Single', 'Double', 'Suite', 'Deluxe', 'Penthouse'];

export default function PublicRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (params?: any) => {
    setLoading(true);
    try {
      const res = await roomAPI.search(params || {});
      setRooms(res.data.data || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (query) params.query = query;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (roomType) params.roomType = roomType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    fetchRooms(params);
  };

  const clearFilters = () => {
    setCheckIn('');
    setCheckOut('');
    setRoomType('');
    setMinPrice('');
    setMaxPrice('');
    setQuery('');
    fetchRooms();
  };

  const hasFilters = checkIn || checkOut || roomType || minPrice || maxPrice || query;

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect <span className="gradient-text">Room</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Browse our rooms and check availability. Book directly for the best rates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-8"
          >
            <form onSubmit={handleSearch}>
              <div className="grid md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Check-in</label>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-white/[0.02] border-white/10 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Check-out</label>
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-white/[0.02] border-white/10 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input placeholder="Room #, type..." value={query} onChange={(e) => setQuery(e.target.value)}
                      className="pl-9 bg-white/[0.02] border-white/10 text-white text-sm placeholder:text-gray-600" />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" variant="gradient" className="flex-1">
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                  <button type="button" onClick={() => setShowFilters(!showFilters)}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-gray-400 hover:text-white">
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end">
                  {hasFilters && (
                    <Button type="button" variant="ghost" onClick={clearFilters}
                      className="text-gray-400 text-sm">
                      <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="grid md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Room Type</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-3 py-2.5 text-sm">
                      <option value="" className="bg-[#0b1120]">All Types</option>
                      {roomTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#0b1120]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Min Price / Night</label>
                    <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-white/[0.02] border-white/10 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Max Price / Night</label>
                    <Input type="number" placeholder="1000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-white/[0.02] border-white/10 text-white text-sm" />
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <Bed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">No rooms found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-500 bg-white/[0.02]"
                >
                  <div className="h-48 relative">
                    {room.images && room.images.length > 0 ? (
                      <Image
                        src={room.images[0]}
                        alt={`Room ${room.roomNumber}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-indigo-400/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge variant="premium" className="text-xs">{room.roomType}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {formatCurrency(room.pricePerNight)}
                        <span className="text-sm text-gray-400">/night</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Room {room.roomNumber}</h3>
                      <Badge variant={room.status === 'AVAILABLE' ? 'success' : 'warning'} className="text-[10px]">
                        {room.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{room.description || 'No description available'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> Up to {room.capacity}</span>
                      <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {room.beds} Bed(s)</span>
                      {room.size && <span>{room.size} sq ft</span>}
                    </div>
                    {room.hotel && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {room.hotel.name}{room.hotel.city ? `, ${room.hotel.city}` : ''}
                      </div>
                    )}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities.slice(0, 4).map((a: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-gray-400">
                            {a}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-gray-500">
                            +{room.amenities.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    <Link href={`/rooms/${room.id}`} className="block">
                      <Button variant="gradient" className="w-full group">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
