'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { notificationAPI } from '@/lib/api';
import { Bell, CheckCheck, Trash2, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

type FilterType = 'ALL' | 'BOOKING' | 'INFO' | 'ALERT';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Booking', value: 'BOOKING' },
  { label: 'Info', value: 'INFO' },
  { label: 'Alert', value: 'ALERT' },
];

const typeIcon = (type: string) => {
  switch (type) {
    case 'BOOKING':
      return <CalendarCheck className="w-5 h-5 text-cyan-400 mt-0.5" />;
    case 'ALERT':
      return <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />;
    default:
      return <Bell className="w-5 h-5 text-blue-400 mt-0.5" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: PAGE_SIZE };
      if (filter !== 'ALL') params.type = filter;
      const res = await notificationAPI.getAll(params);
      const body = res.data;
      const data = body.data ?? [];
      setNotifications(data);
      if (body.pagination) {
        setTotalPages(body.pagination.totalPages ?? 1);
      } else {
        setTotalPages(1);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-40 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-white/[0.04] animate-pulse mt-2" />
          </div>
          <div className="h-9 w-36 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            className="text-white border-white/20 hover:bg-white/[0.05]"
            onClick={markAllRead}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              notif.isRead
                ? 'bg-white/[0.01] border-white/5'
                : 'bg-indigo-500/[0.03] border-indigo-500/20'
            }`}
            onClick={() => !notif.isRead && markAsRead(notif.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 min-w-0">
                {typeIcon(notif.type)}
                <div className="min-w-0">
                  <p
                    className={`text-sm ${
                      notif.isRead ? 'text-gray-300' : 'text-white font-bold'
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      notif.isRead ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
                <button
                  aria-label="Delete notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications</p>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
