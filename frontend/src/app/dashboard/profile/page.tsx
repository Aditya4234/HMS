'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getInitials, formatDate } from '@/lib/utils';
import {
  User, Mail, Phone, Calendar, Shield, Camera,
  Save, Loader2, CheckCircle, XCircle, AlertTriangle,
  LogOut, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        const profile = res.data.data;
        setUser(profile);
        setProfileForm({
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await authAPI.updateProfile(formData);
      setUser(res.data.data);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await authAPI.deleteAccount();
      logout();
      toast.success('Account deleted');
      router.push('/');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'premium',
    HOTEL_ADMIN: 'info',
    RECEPTIONIST: 'success',
    STAFF: 'warning',
    CUSTOMER: 'default',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and account settings</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-6">
              <div className="relative group">
                <Avatar className="w-28 h-28 border-4 border-[#0b1120] ring-2 ring-white/10">
                  <AvatarImage src={user?.avatar || ''} />
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-3xl">
                    {user ? getInitials(user.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                  {user?.email}
                </p>
              </div>
              <Badge variant={(roleColors[user?.role || ''] || 'default') as any} className="capitalize">
                {(user?.role || '').replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Mail className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-white truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Phone className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-white">{user?.phoneNumber || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm text-white">{user?.lastLogin ? formatDate(user.lastLogin) : 'New'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Email verified:</span>
              {user?.emailVerified ? (
                <Badge variant="success" className="text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Not Verified
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-white text-lg">Personal Information</CardTitle>
            </div>
            <CardDescription className="text-gray-500">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                <Input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="bg-white/[0.02] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <Input value={user?.email || ''} disabled className="bg-white/[0.02] border-white/10 text-white/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                <Input
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  placeholder="+1 234 567 890"
                  className="bg-white/[0.02] border-white/10 text-white"
                />
              </div>
            </div>
            <Button
              variant="gradient"
              className="flex items-center gap-2"
              onClick={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <CardTitle className="text-white text-lg">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-gray-500">Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-white">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account and all associated data</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}