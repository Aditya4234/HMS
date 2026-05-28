'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staffAPI } from '@/lib/api';
import { Building2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-gray-500 text-sm">Manage your team</p>
        </div>
        <Button variant="gradient"><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
      </div>

      <div className="grid gap-4">
        {staff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{member.fullName}</h3>
                    <Badge variant={member.isActive ? 'success' : 'destructive'} className="text-[10px]">
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{member.position} • {member.department}</p>
                  <p className="text-xs text-gray-500">ID: {member.employeeId}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>{member.email}</p>
                {member.salary && <p>${member.salary.toLocaleString()}/yr</p>}
              </div>
            </div>
          </motion.div>
        ))}
        {staff.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No staff members</p>
          </div>
        )}
      </div>
    </div>
  );
}
