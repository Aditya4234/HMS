'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp, Users, Bed, CalendarCheck, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, AlertCircle,
  Plus, Building2, LogOut, Clock, Sun, Moon, Star,
  Sparkles, ChevronRight, Zap, ShieldCheck, BarChart3,
  CheckCircle2, XCircle, Timer, Hotel,
} from 'lucide-react';

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
    ref.current = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * value);

      if (current !== ref.current) {
        ref.current = current;
        setDisplay(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

const greetings = [
  { time: [5, 11], text: 'Good Morning', icon: Sun },
  { time: [11, 17], text: 'Good Afternoon', icon: Sun },
  { time: [17, 21], text: 'Good Evening', icon: Moon },
  { time: [21, 24], text: 'Good Night', icon: Moon },
  { time: [0, 5], text: 'Good Night', icon: Moon },
];

function getGreeting() {
  const hour = new Date().getHours();
  return greetings.find((g) => hour >= g.time[0] && hour < g.time[1]) || greetings[0];
}

const quickActions = [
  { label: 'New Booking', href: '/dashboard/bookings', icon: CalendarCheck, color: 'from-blue-500 to-cyan-500' },
  { label: 'Add Room', href: '/dashboard/rooms', icon: Plus, color: 'from-green-500 to-emerald-500' },
  { label: 'View Staff', href: '/dashboard/staff', icon: Users, color: 'from-purple-500 to-pink-500' },
  { label: 'Invoices', href: '/dashboard/invoices', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
];

const statusColors: Record<string, string> = {
  CONFIRMED: 'info',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'warning',
  CANCELLED: 'destructive',
  PENDING: 'warning',
  AVAILABLE: 'success',
  OCCUPIED: 'info',
  MAINTENANCE: 'warning',
  PAID: 'success',
  PENDING_PAYMENT: 'warning',
  OVERDUE: 'destructive',
} as const;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [bookingChart, setBookingChart] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topRooms, setTopRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const greeting = getGreeting();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes, bookingRes, activitiesRes, roomsRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRevenueChart({ months: 6 }),
          dashboardAPI.getBookingChart({ days: 30 }),
          dashboardAPI.getRecentActivities(),
          dashboardAPI.getTopRooms(),
        ]);
        setStats(statsRes.data.data);
        setRevenueChart(revenueRes.data.data);
        setBookingChart(bookingRes.data.data);
        setActivities(activitiesRes.data.data);
        setTopRooms(roomsRes.data.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNestedValue = useCallback((obj: any, path: string) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button variant="gradient" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 18c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-12 0c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-indigo-200 text-sm font-medium">{greeting.text}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {user?.fullName || 'User'}
            </h1>
            <p className="text-indigo-100 text-sm flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {today}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10">
              <p className="text-xs text-indigo-200">Your Role</p>
              <p className="text-sm font-semibold text-white">{user?.role?.replace(/_/g, ' ') || 'N/A'}</p>
            </div>
            <Badge variant="success" className="text-xs px-3 py-1.5">
              <Activity className="w-3 h-3 mr-1 animate-pulse" /> Live
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickActions.map((action, i) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} p-2.5`}>
                  <action.icon className="w-full h-full text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm text-gray-400 mt-3 group-hover:text-white transition-colors">{action.label}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Revenue Today */}
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Today&apos;s Revenue</p>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 p-2">
                <DollarSign className="w-full h-full text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={getNestedValue(stats, 'revenue.today') || 0} prefix="$" />
            </p>
            <p className="text-xs text-gray-500 mt-1">Monthly: {formatCurrency(getNestedValue(stats, 'revenue.monthly') || 0)}</p>
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Active Bookings</p>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 p-2">
                <CalendarCheck className="w-full h-full text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={getNestedValue(stats, 'bookings.active') || 0} />
            </p>
            <p className="text-xs text-gray-500 mt-1">Total: {getNestedValue(stats, 'bookings.total') || 0} bookings</p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Occupancy Rate</p>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 p-2">
                <Bed className="w-full h-full text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={Number((getNestedValue(stats, 'rooms.occupancyRate') || 0).toFixed(1))} suffix="%" />
            </p>
            <p className="text-xs text-gray-500 mt-1">{getNestedValue(stats, 'rooms.available') || 0} rooms available</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Customers</p>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-2">
                <Users className="w-full h-full text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={getNestedValue(stats, 'customers') || 0} />
            </p>
            <p className="text-xs text-gray-500 mt-1">{getNestedValue(stats, 'staff') || 0} staff members</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Overview + Revenue Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/[0.02] border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Today&apos;s Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Check-ins Today</p>
                        <p className="text-xl font-bold text-white">{getNestedValue(stats, 'bookings.todayCheckIns') || 0}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-amber-400 rotate-180" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Check-outs Today</p>
                        <p className="text-xl font-bold text-white">{getNestedValue(stats, 'bookings.todayCheckOuts') || 0}</p>
                      </div>
                    </div>
                    <ArrowDownRight className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Revenue Today</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(getNestedValue(stats, 'revenue.today') || 0)}</p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/[0.02] border-white/5 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Revenue Overview
                </CardTitle>
                <Badge variant="outline" className="text-xs text-gray-500">
                  Last 6 months
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {revenueChart.length > 0 ? (
                <>
                  <div className="h-56 flex items-end justify-between gap-1.5">
                    {revenueChart.map((item: any, i: number) => {
                      const maxRevenue = Math.max(...revenueChart.map((r: any) => r.revenue));
                      const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                            className="w-full relative group"
                            style={{ minHeight: height > 0 ? '12px' : '4px' }}
                          >
                            <div
                              className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                            />
                            <div
                              className="absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-t from-transparent to-purple-300/20"
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 backdrop-blur px-2.5 py-1 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                              {formatCurrency(item.revenue)}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-3">
                    {revenueChart.map((item: any, i: number) => (
                      <span key={i} className="text-xs text-gray-500">
                        {new Date(item.month + '-01').toLocaleDateString('en', { month: 'short' })}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-56 flex items-center justify-center text-gray-500 text-sm">No revenue data yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid: Top Rooms + Recent Activities + Room Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Performing Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/[0.02] border-white/5 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Top Rooms
                </CardTitle>
                <Badge variant="outline" className="text-xs text-gray-500">
                  By bookings
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {topRooms.length > 0 ? (
                <div className="space-y-3">
                  {topRooms.map((room: any, i: number) => {
                    const maxBookings = Math.max(...topRooms.map((r: any) => r.totalBookings));
                    const barWidth = maxBookings > 0 ? (room.totalBookings / maxBookings) * 100 : 0;
                    return (
                      <div key={room.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                                Room {room.roomNumber}
                              </p>
                              <p className="text-xs text-gray-500">{room.roomType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white">{room.totalBookings}</p>
                            <Badge variant={(statusColors[room.status] || 'outline') as any} className="text-[10px]">
                              {room.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                            className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' : i === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-white/20'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bed className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No room data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-white/[0.02] border-white/5 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Recent Activity
                </CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-white">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-0">
                  {activities.slice(0, 6).map((activity: any, i: number) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 py-3 border-b border-white/[0.03] last:border-0"
                    >
                      <div className="relative flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                          activity.status === 'CONFIRMED' || activity.status === 'CHECKED_IN'
                            ? 'bg-green-500'
                            : activity.status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`} />
                        {i < activities.slice(0, 6).length - 1 && (
                          <div className="w-px h-full min-h-[24px] bg-white/[0.05] mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap mt-0.5">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Room Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/[0.02] border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Hotel className="w-4 h-4 text-indigo-400" />
                Room Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.rooms ? (
                <div className="space-y-5">
                  {[
                    { label: 'Available', value: stats.rooms.available, color: 'bg-green-500', icon: CheckCircle2, total: stats.rooms.total, iconColor: 'text-green-400' },
                    { label: 'Occupied', value: stats.rooms.occupied, color: 'bg-blue-500', icon: Building2, total: stats.rooms.total, iconColor: 'text-blue-400' },
                    { label: 'Maintenance', value: stats.rooms.maintenance, color: 'bg-yellow-500', icon: Timer, total: stats.rooms.total, iconColor: 'text-yellow-400' },
                  ].map((item) => {
                    const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                            <span className="text-sm text-gray-400">{item.label}</span>
                          </div>
                          <span className="text-sm text-white font-medium">{item.value}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${item.color} relative`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{pct.toFixed(0)}% of total</p>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Rooms</span>
                      <span className="text-white font-bold">{stats.rooms.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Hotel className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No room data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
