'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationAPI } from '@/lib/api';
import { Bell, CheckCheck, Trash2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || res.data);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      toast.success('All marked as read');
      fetchNotifications();
    } catch {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch {}
  };

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated</p>
        </div>
        <Button variant="outline" className="text-white border-white/20" onClick={markAllRead}>
          <CheckCheck className="w-4 h-4 mr-2" />Mark All Read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`p-4 rounded-xl border ${notif.isRead ? 'bg-white/[0.01] border-white/5' : 'bg-indigo-500/[0.03] border-indigo-500/20'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {notif.type === 'ERROR' ? <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" /> :
                 notif.type === 'SUCCESS' ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> :
                 <Info className="w-5 h-5 text-blue-400 mt-0.5" />}
                <div>
                  <p className="text-white text-sm font-medium">{notif.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                  <p className="text-gray-600 text-xs mt-1">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                <button onClick={() => deleteNotif(notif.id)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-red-400 transition-all">
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
    </div>
  );
}
