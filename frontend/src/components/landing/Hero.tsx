'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, TrendingUp, Users, CalendarCheck, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { searchPexelsImages } from '@/lib/pexels';

const floatingCards = [
  { icon: TrendingUp, label: 'Revenue', value: '$12.4k', color: 'from-green-400 to-emerald-500', trend: '+23%' },
  { icon: Users, label: 'Guests', value: '1,847', color: 'from-blue-400 to-indigo-500', trend: '+12%' },
  { icon: CalendarCheck, label: 'Bookings', value: '342', color: 'from-purple-400 to-pink-500', trend: '+18%' },
  { icon: DollarSign, label: 'ADR', value: '$245', color: 'from-orange-400 to-red-500', trend: '+8%' },
];

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    searchPexelsImages('luxury hotel resort lobby', 1).then((photos) => {
      if (photos.length > 0) setHeroImage(photos[0].src.large2x);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0b1120]">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                ✨ The #1 Hotel Management Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white leading-tight"
            >
              Manage Your Hotel{' '}
              <span className="gradient-text">Like Never Before</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 leading-relaxed max-w-lg"
            >
              Automate bookings, manage rooms, streamline operations, and deliver exceptional guest experiences with our all-in-one hotel management platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/register">
                <Button variant="gradient" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="text-white border-white/20 hover:bg-white/5">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center space-x-8 text-sm text-gray-500"
            >
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                99.9% Uptime
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                24/7 Support
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="Luxury hotel"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120]/80 via-transparent to-transparent" />
            </div>

            {floatingCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                className={`absolute ${
                  index === 0 ? '-top-4 -right-4' :
                  index === 1 ? '-bottom-4 -left-4' :
                  index === 2 ? 'top-1/2 -right-8' :
                  'bottom-1/4 -left-8'
                } p-3 rounded-xl glass border border-white/10 backdrop-blur-xl`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{card.label}</p>
                    <p className="text-sm font-bold text-white">{card.value}</p>
                    <p className="text-xs text-green-400">{card.trend}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
