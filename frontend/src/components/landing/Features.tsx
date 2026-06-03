'use client';

import { motion } from 'framer-motion';
import { Building2, Bed, CalendarCheck, Users, Bell, BarChart3, Shield, Settings } from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Hotel Management',
    description: 'Complete control over your property with real-time room status, pricing, and availability management.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Bed,
    title: 'Room Management',
    description: 'Easily manage room types, categories, amenities, and dynamic pricing across your entire inventory.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Bookings',
    description: 'Automated booking engine with real-time availability, conflict detection, and instant confirmation.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Comprehensive guest profiles with booking history, preferences, and automated communication.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Multi-channel notifications via email, SMS, and in-app for bookings, payments, and updates.',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Powerful analytics dashboard with revenue reports, occupancy trends, and performance metrics.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    description: 'Secure role-based access control for admin, reception, staff, and customers with audit logs.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Settings,
    title: 'Customization',
    description: 'Flexible settings for hotel policies, pricing rules, taxes, and seasonal rate adjustments.',
    gradient: 'from-sky-500 to-blue-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-[#0b1120] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            🚀 Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Run Your Hotel</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From room management to analytics, we provide all the tools to streamline your hotel operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mb-4`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
