'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Calendar, Shield, Sparkles } from 'lucide-react';
import { mongoAuthAPI } from '@/lib/mongoApi';
import { toast } from 'sonner';

export default function MongoProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('mongoAccessToken');
    if (!token) {
      router.push('/mongo-login');
      return;
    }

    mongoAuthAPI.getProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => {
        localStorage.removeItem('mongoAccessToken');
        localStorage.removeItem('mongoUser');
        router.push('/mongo-login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await mongoAuthAPI.logout();
    } catch {
    } finally {
      localStorage.removeItem('mongoAccessToken');
      localStorage.removeItem('mongoUser');
      toast.success('Logged out successfully');
      router.push('/mongo-login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="max-w-md mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {profile.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{profile.fullName}</p>
                <p className="text-gray-400 text-sm">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm capitalize">Role: {profile.role.toLowerCase()}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">
                  Joined: {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">ID: {profile.id}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
