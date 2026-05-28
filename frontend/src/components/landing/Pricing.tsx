'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small hotels and B&Bs',
    features: ['Up to 20 Rooms', 'Basic Analytics', 'Email Support', 'Booking Management', 'Staff Accounts (5)'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'Ideal for growing hotel businesses',
    features: ['Up to 100 Rooms', 'Advanced Analytics', 'Priority Support', 'Payment Integration', 'Staff Accounts (20)', 'API Access', 'Custom Reports'],
    popular: true,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'For large hotel chains and groups',
    features: ['Unlimited Rooms', 'AI Analytics', '24/7 Dedicated Support', 'Custom Integrations', 'Unlimited Staff', 'White Label', 'SLA Guarantee'],
    gradient: 'from-purple-500 to-pink-500',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            💎 Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your hotel. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? 'border-indigo-500/50 bg-indigo-500/5'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium">Most Popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  variant={plan.popular ? 'gradient' : 'outline'}
                  className={`w-full ${!plan.popular && 'text-white border-white/20 hover:bg-white/5'}`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
