'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

export default function DashboardPreview() {
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
            📊 Powerful Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real-Time Hotel{' '}
            <span className="gradient-text">Analytics Dashboard</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor every aspect of your hotel operations with beautiful, real-time analytics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-1 border-b border-white/5">
              <div className="flex items-center space-x-2 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-500">dashboard.hotelmanager.com</span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: '$284,500', change: '+23.5%', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
                  { label: 'Active Guests', value: '1,247', change: '+12.3%', icon: Users, color: 'from-emerald-500 to-teal-500' },
                  { label: 'Occupancy Rate', value: '94.2%', change: '+5.7%', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Today Bookings', value: '48', change: '+18.2%', icon: Calendar, color: 'from-amber-500 to-orange-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} p-1.5`}>
                        <stat.icon className="w-full h-full text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-green-400">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Revenue Overview</h3>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: h }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Room Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Occupied', value: 68, color: 'bg-blue-500' },
                      { label: 'Available', value: 22, color: 'bg-green-500' },
                      { label: 'Maintenance', value: 7, color: 'bg-yellow-500' },
                      { label: 'Reserved', value: 3, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-white">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
