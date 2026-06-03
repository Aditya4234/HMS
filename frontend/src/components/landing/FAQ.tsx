'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the booking system work?',
    answer: 'Our booking system provides real-time room availability, automated conflict detection, and instant confirmation. Guests can book through your website or you can manually create bookings from the dashboard.',
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'Yes, our platform is fully responsive and works seamlessly on all devices. We also offer dedicated mobile apps for iOS and Android for both staff and guests.',
  },
  {
    question: 'How does the multi-property management work?',
    answer: 'The Enterprise plan allows you to manage multiple properties from a single dashboard. You can switch between properties, compare performance, and manage all operations centrally.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer 24/7 email and chat support for all plans. Professional and Enterprise plans include priority support with dedicated account managers and phone support.',
  },
  {
    question: 'Can I customize the platform for my hotel brand?',
    answer: 'Absolutely! You can customize room types, amenities, pricing rules, tax settings, and more. Enterprise plans include white-label options for complete brand customization.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 bg-[#0b1120]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            ❓ FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 pt-0 text-gray-400 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
