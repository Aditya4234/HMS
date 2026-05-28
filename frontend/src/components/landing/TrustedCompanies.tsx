'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'Marriott', gradient: 'from-blue-400 to-indigo-400' },
  { name: 'Hilton', gradient: 'from-blue-500 to-cyan-400' },
  { name: 'Hyatt', gradient: 'from-green-400 to-emerald-400' },
  { name: 'Accor', gradient: 'from-purple-400 to-pink-400' },
  { name: 'IHG', gradient: 'from-orange-400 to-red-400' },
  { name: 'Wyndham', gradient: 'from-yellow-400 to-amber-400' },
];

export default function TrustedCompanies() {
  return (
    <section className="py-20 bg-[#0b1120] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 mb-12 uppercase tracking-widest font-medium"
        >
          Trusted by leading hospitality brands worldwide
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {companies.map((company, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-center"
            >
              <span className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${company.gradient} opacity-50 hover:opacity-100 transition-opacity`}>
                {company.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
