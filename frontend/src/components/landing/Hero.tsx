'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, TrendingUp, Users, CalendarCheck, DollarSign } from 'lucide-react';
import Link from 'next/link';

const floatingCards = [
  { icon: TrendingUp, label: 'Revenue', value: '$12.4k', color: 'from-green-400 to-emerald-500', trend: '+23%' },
  { icon: Users, label: 'Guests', value: '1,847', color: 'from-blue-400 to-indigo-500', trend: '+12%' },
  { icon: CalendarCheck, label: 'Bookings', value: '342', color: 'from-purple-400 to-pink-500', trend: '+18%' },
  { icon: DollarSign, label: 'ADR', value: '$245', color: 'from-orange-400 to-red-500', trend: '+8%' },
];

export default function Hero() {
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
            <div className="relative w-full aspect-[4/3] rounded-2xl glass overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-500">Dashboard Preview</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Revenue', value: '$48,290', change: '+24%', color: 'from-indigo-500 to-purple-500' },
                    { label: 'Occupancy', value: '87%', change: '+12%', color: 'from-emerald-500 to-teal-500' },
                    { label: 'Active Bookings', value: '156', change: '+8%', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Avg Rating', value: '4.8', change: '+0.3', color: 'from-amber-500 to-orange-500' },
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-green-400">{stat.change} vs last month</p>
                    </div>
                  ))}
                </div>

                <div className="h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-full px-4">
                    <div className="flex items-end justify-between h-16">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: h }}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                          className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
