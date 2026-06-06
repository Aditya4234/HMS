'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bed, Users, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { roomAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function RoomShowcase() {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    roomAPI.getAvailable({ limit: 3 }).then((res) => {
      setRooms(res.data.data?.slice(0, 3) || []);
    }).catch(() => {});
  }, []);

  return (
    <section className="py-32 bg-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            Luxury Rooms
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Beautiful Rooms at Your{' '}
            <span className="gradient-text">Fingertips</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse our curated selection of rooms available for booking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-500"
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
                <div className="absolute top-4 right-4">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {formatCurrency(room.pricePerNight)}
                    <span className="text-sm text-white/70">/night</span>
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="premium" className="text-xs">{room.roomType || 'Featured'}</Badge>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Room {room.roomNumber}</h3>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {room.beds} Bed</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> Up to {room.capacity}</span>
                </div>
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-gray-300 border border-white/10">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={`/rooms/${room.id}`}>
                  <Button variant="gradient" className="w-full group">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/rooms">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/5">
              View All Rooms <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
