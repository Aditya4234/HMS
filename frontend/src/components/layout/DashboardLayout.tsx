'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Bed,
  CalendarCheck,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  MessageSquare,
  Sparkles,
  FileText,
  Loader2,
} from 'lucide-react';
import { authAPI, notificationAPI } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';

const allSidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Rooms', href: '/dashboard/rooms', icon: Bed, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'] },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'] },
  { name: 'Staff', href: '/dashboard/staff', icon: Building2, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN'] },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST', 'CUSTOMER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const sidebarLinks = allSidebarLinks.filter(
    (link) => !user?.role || link.roles.includes(user.role)
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const syncProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data.data);
      } catch {
        logout();
        router.replace('/login');
      }
    };

    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll({ limit: 1 });
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };

    syncProfile();
    fetchUnread();

    const token = localStorage.getItem('accessToken');
    if (token) {
      const socket = connectSocket(token, user?.hotelId);
      socket.on('new-notification', () => {
        setUnreadCount((prev) => prev + 1);
        toast.info('New notification');
        fetchUnread();
      });
      socket.on('booking-updated', () => {
        toast.info('Booking has been updated');
      });
      socket.on('room-status-changed', () => {
        toast.info('Room status changed');
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [isHydrated, isAuthenticated, setUser, router, user?.hotelId]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full px-4 py-6 bg-[#0b1120] border-r border-white/5 flex flex-col">
          <Link href="/dashboard" className="flex items-center space-x-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-white">HotelManager</span>
          </Link>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between px-3 py-2">
              <Link href="/" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                Back to Website
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              <Link href="/dashboard/notifications" aria-label="Notifications">
                <button className="relative p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[8px] h-2 px-0.5 rounded-full bg-red-500" />
                  )}
                </button>
              </Link>

              <div className="relative">
                <button
                  aria-label="User menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/[0.05] transition-all"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs">
                      {user ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ') || 'Guest'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/10 shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
