'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hotelAPI, authAPI } from '@/lib/api';
import { User, Lock, Building2, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [hotelForm, setHotelForm] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setProfileForm({ fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || '' });
        if (user?.role !== 'CUSTOMER') {
          const res = await hotelAPI.getSettings();
          setHotel(res.data.data);
          setHotelForm(res.data.data || {});
        }
      } catch { toast.error('Failed to load settings'); } finally { setLoading(false); }
    };
    fetchSettings();
  }, [user]);

  const updateProfile = async () => {
    try {
      await authAPI.updateProfile(profileForm);
      setUser({ ...user!, fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
  };

  const updatePassword = async () => {
    try {
      await authAPI.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch { toast.error('Failed to update password'); }
  };

  const updateHotelSettings = async () => {
    try {
      await hotelAPI.update(hotelForm);
      toast.success('Hotel settings updated');
    } catch { toast.error('Failed to update hotel settings'); }
  };

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
              <Input value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="bg-white/[0.02] border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <Input value={user?.email || ''} disabled className="bg-white/[0.02] border-white/10 text-white/50" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
              <Input value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                className="bg-white/[0.02] border-white/10 text-white" />
            </div>
          </div>
          <Button variant="gradient" className="flex items-center space-x-2" onClick={updateProfile}>
            <Save className="w-4 h-4" /><span>Save Changes</span>
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
              <Input type="password" value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="bg-white/[0.02] border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">New Password</label>
              <Input type="password" value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="bg-white/[0.02] border-white/10 text-white" />
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20" onClick={updatePassword}>Update Password</Button>
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
                <Input value={hotelForm.name || ''} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency</label>
                <Input value={hotelForm.currency || ''} onChange={(e) => setHotelForm({ ...hotelForm, currency: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tax Rate (%)</label>
                <Input type="number" value={hotelForm.taxRate || ''}
                  onChange={(e) => setHotelForm({ ...hotelForm, taxRate: parseFloat(e.target.value) || 0 })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Check-in Time</label>
                <Input value={hotelForm.checkInTime || ''} onChange={(e) => setHotelForm({ ...hotelForm, checkInTime: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Check-out Time</label>
                <Input value={hotelForm.checkOutTime || ''} onChange={(e) => setHotelForm({ ...hotelForm, checkOutTime: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Timezone</label>
                <Input value={hotelForm.timezone || ''} onChange={(e) => setHotelForm({ ...hotelForm, timezone: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white" />
              </div>
            </div>
            <Button variant="gradient" className="flex items-center space-x-2" onClick={updateHotelSettings}>
              <Save className="w-4 h-4" /><span>Save Hotel Settings</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
