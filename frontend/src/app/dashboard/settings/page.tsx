'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { hotelAPI, authAPI } from '@/lib/api';
import { Settings, Save, User, Lock, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (user?.role !== 'CUSTOMER') {
          const res = await hotelAPI.getSettings();
          setHotel(res.data.data);
        }
      } catch {} finally { setLoading(false); }
    };
    fetchSettings();
  }, [user]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and hotel preferences</p>
      </div>

      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-white text-lg">Profile</CardTitle>
          </div>
          <CardDescription className="text-gray-500">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <Input defaultValue={user?.fullName} className="bg-white/[0.02] border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <Input defaultValue={user?.email} disabled className="bg-white/[0.02] border-white/10 text-white/50" />
            </div>
          </div>
          <Button variant="gradient" className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-white text-lg">Password</CardTitle>
          </div>
          <CardDescription className="text-gray-500">Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Current Password</label>
              <Input type="password" className="bg-white/[0.02] border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">New Password</label>
              <Input type="password" className="bg-white/[0.02] border-white/10 text-white" />
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20">Update Password</Button>
        </CardContent>
      </Card>

      {hotel && (
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-white text-lg">Hotel Settings</CardTitle>
            </div>
            <CardDescription className="text-gray-500">Configure your hotel preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Hotel Name</label>
                <Input defaultValue={hotel.name} className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency</label>
                <Input defaultValue={hotel.currency} className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tax Rate (%)</label>
                <Input defaultValue={hotel.taxRate} type="number" className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Check-in Time</label>
                <Input defaultValue={hotel.checkInTime} className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Check-out Time</label>
                <Input defaultValue={hotel.checkOutTime} className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Timezone</label>
                <Input defaultValue={hotel.timezone} className="bg-white/[0.02] border-white/10 text-white" />
              </div>
            </div>
            <Button variant="gradient" className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Hotel Settings</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
