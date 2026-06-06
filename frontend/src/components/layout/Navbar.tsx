'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { name: 'Rooms', href: '/rooms' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-white">
              Hotel<span className="text-indigo-400">Manager</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="gradient" size="default">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="default">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0b1120]/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {isAuthenticated ? (
                  <Link href="/dashboard" className="block">
                    <Button variant="gradient" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full text-white border-white/20">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button variant="gradient" className="w-full">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
