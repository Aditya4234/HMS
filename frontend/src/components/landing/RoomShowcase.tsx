'use client';

import { motion } from 'framer-motion';
import { Bed, Bath, Users, Wifi, Snowflake, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const rooms = [
  {
    name: 'Presidential Suite',
    price: '$899',
    image: '/image/image1.png',
    size: '120m²',
    beds: 2,
    guests: 4,
    amenities: ['Ocean View', 'King Bed', 'Jacuzzi', 'Mini Bar'],
  },
  {
    name: 'Executive Room',
    price: '$549',
    image: '/image/image2.png',
    size: '65m²',
    beds: 1,
    guests: 2,
    amenities: ['City View', 'Queen Bed', 'Work Desk', 'Smart TV'],
  },
  {
    name: 'Deluxe Suite',
    price: '$349',
    image: '/image/image3.png',
    size: '45m²',
    beds: 1,
    guests: 2,
    amenities: ['Garden View', 'Double Bed', 'Sitting Area', 'Mini Bar'],
  },
];

export default function RoomShowcase() {
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
            🏨 Luxury Rooms
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Beautiful Rooms at Your{' '}
            <span className="gradient-text">Fingertips</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage all room types, pricing, and availability from a single dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-500"
            >
              <div className="h-48 p-6 flex flex-col justify-between bg-cover bg-center" style={{ backgroundImage: `url(${room.image})` }}>
                <div className="flex justify-between items-start">
                  <Badge variant="premium" className="text-xs">Featured</Badge>
                  <span className="text-2xl font-bold text-white">{room.price}<span className="text-sm text-white/70">/night</span></span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{room.name}</h3>
                  <p className="text-sm text-white/70">{room.size}</p>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {room.beds} Bed</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {room.guests} Guests</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-gray-300 border border-white/10">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
