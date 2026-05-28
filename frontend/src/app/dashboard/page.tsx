'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  TrendingUp, Users, Bed, CalendarCheck, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';

const statsConfig = [
  { key: 'revenue.monthly', label: 'Monthly Revenue', icon: DollarSign, color: 'from-green-400 to-emerald-500', prefix: '$' },
  { key: 'bookings.active', label: 'Active Bookings', icon: CalendarCheck, color: 'from-blue-400 to-cyan-500' },
  { key: 'rooms.occupancyRate', label: 'Occupancy Rate', icon: Bed, color: 'from-purple-400 to-pink-500', suffix: '%' },
  { key: 'customers', label: 'Total Customers', icon: Users, color: 'from-amber-400 to-orange-500' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topRooms, setTopRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes, activitiesRes, roomsRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRevenueChart({ months: 6 }),
          dashboardAPI.getRecentActivities(),
          dashboardAPI.getTopRooms(),
        ]);
        setStats(statsRes.data.data);
        setRevenueChart(revenueRes.data.data);
        setActivities(activitiesRes.data.data);
        setTopRooms(roomsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's your hotel overview.</p>
        </div>
        <Badge variant="success" className="text-xs">
          <Activity className="w-3 h-3 mr-1" /> Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((config, index) => {
          const value = getNestedValue(stats, config.key);
          const displayValue = value !== undefined ? value : 0;
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/[0.02] border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-400">{config.label}</p>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} p-2`}>
                      <config.icon className="w-full h-full text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {config.prefix}{config.suffix ? '' : ''}
                    {config.key.includes('revenue') ? formatCurrency(displayValue) : config.suffix ? Number(displayValue).toFixed(1) : formatNumber(displayValue)}
                    {config.suffix}
                  </p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5% vs last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-lg">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueChart.map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.revenue / Math.max(...revenueChart.map((r: any) => r.revenue))) * 100}%` }}
                    transition={{ delay: i * 0.03, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md relative group"
                    style={{ minHeight: '8px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {revenueChart.map((item: any, i: number) => (
                  <span key={i} className="text-xs text-gray-600">
                    {item.month?.slice(5) || ''}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity: any, i: number) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.details}</p>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
                {activities.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-lg">Top Performing Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRooms.map((room: any, i: number) => (
                <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-6">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-white">Room {room.roomNumber}</p>
                      <p className="text-xs text-gray-500">{room.roomType} - ${room.pricePerNight}/night</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{room.totalBookings} bookings</p>
                    <Badge variant={room.status === 'AVAILABLE' ? 'success' : room.status === 'OCCUPIED' ? 'info' : 'warning'} className="text-[10px]">
                      {room.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {topRooms.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No rooms data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-lg">Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.rooms && (
              <div className="space-y-4">
                {[
                  { label: 'Available', value: stats.rooms.available, color: 'bg-green-500', total: stats.rooms.total },
                  { label: 'Occupied', value: stats.rooms.occupied, color: 'bg-blue-500', total: stats.rooms.total },
                  { label: 'Maintenance', value: stats.rooms.maintenance, color: 'bg-yellow-500', total: stats.rooms.total },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{item.value}/{item.total}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / (item.total || 1)) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
