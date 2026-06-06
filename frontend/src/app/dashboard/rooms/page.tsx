'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RoomImage } from '@/components/ui/room-image';
import { roomAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Bed, Edit, Trash2, X, Upload } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTIONIST'];
const PAGE_SIZE = 10;

export default function RoomsPage() {
  const { user } = useAuthStore();
  const canManage = user && ADMIN_ROLES.includes(user.role);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    roomNumber: '', roomType: '', floor: '', description: '',
    pricePerNight: '', capacity: '2', size: '', beds: '1', status: 'AVAILABLE',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchRooms(); }, [page]);

  const fetchRooms = async () => {
    try {
      const res = await roomAPI.getAll({ page, limit: PAGE_SIZE });
      setRooms(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load rooms');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditRoom(null);
    setForm({ roomNumber: '', roomType: '', floor: '', description: '', pricePerNight: '', capacity: '2', size: '', beds: '1', status: 'AVAILABLE' });
    setImageFiles([]);
    setImagePreview([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEdit = (room: any) => {
    setEditRoom(room);
    setForm({
      roomNumber: room.roomNumber, roomType: room.roomType, floor: room.floor?.toString() || '',
      description: room.description || '', pricePerNight: room.pricePerNight.toString(),
      capacity: room.capacity.toString(), size: room.size?.toString() || '',
      beds: room.beds.toString(), status: room.status,
    });
    setImageFiles([]);
    setExistingImages(room.images || []);
    setImagePreview(room.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImagePreview((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const existingCount = existingImages.length;
    if (index < existingCount) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreview((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setImagePreview((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      if (editRoom) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      if (editRoom) {
        await roomAPI.update(editRoom.id, formData);
        toast.success('Room updated');
      } else {
        await roomAPI.create(formData);
        toast.success('Room created');
      }
      setShowModal(false);
      fetchRooms();
    } catch { toast.error('Failed to save room'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomAPI.delete(id);
      toast.success('Room deleted');
      fetchRooms();
    } catch { toast.error('Failed to delete room'); }
  };

  const filtered = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.roomType.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-xl bg-white/[0.02] animate-pulse" />
        <div className="grid gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms</h1>
          <p className="text-gray-500 text-sm">Manage your hotel rooms</p>
        </div>
        {canManage && (
          <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex-shrink-0 relative">
                  <RoomImage
                    src={room.images?.[0]}
                    alt={`Room ${room.roomNumber}`}
                    fallbackIndex={i}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">Room {room.roomNumber}</h3>
                    <Badge variant={room.status === 'AVAILABLE' ? 'success' : room.status === 'OCCUPIED' ? 'info' : 'warning'} className="text-[10px]">
                      {room.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{room.roomType} • Floor {room.floor || 'N/A'} • {room.beds} Bed(s)</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(room.pricePerNight)}</p>
                  <p className="text-xs text-gray-500">per night</p>
                </div>
                {canManage && (
                  <div className="flex items-center space-x-2">
                    <button aria-label="Edit room" onClick={() => openEdit(room)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button aria-label="Delete room" onClick={() => handleDelete(room.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bed className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No rooms found</p>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editRoom ? 'Edit Room' : 'Add Room'}</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Room Number *</label>
                    <Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Room Type *</label>
                    <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                      <option value="" className="bg-[#0f172a]">Select type</option>
                      <option value="Single" className="bg-[#0f172a]">Single</option>
                      <option value="Double" className="bg-[#0f172a]">Double</option>
                      <option value="Suite" className="bg-[#0f172a]">Suite</option>
                      <option value="Deluxe" className="bg-[#0f172a]">Deluxe</option>
                      <option value="Penthouse" className="bg-[#0f172a]">Penthouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Floor</label>
                    <Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Price/Night *</label>
                    <Input type="number" step="0.01" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Capacity</label>
                    <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Beds</label>
                    <Input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Size (sq ft)</label>
                    <Input type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                      className="bg-white/[0.02] border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="AVAILABLE" className="bg-[#0f172a]">Available</option>
                      <option value="OCCUPIED" className="bg-[#0f172a]">Occupied</option>
                      <option value="MAINTENANCE" className="bg-[#0f172a]">Maintenance</option>
                      <option value="RESERVED" className="bg-[#0f172a]">Reserved</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Room Images</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreview.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                        <RoomImage src={url} alt={`Image ${idx + 1}`} fill className="object-cover" />
                        <button type="button" onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-400 transition-all">
                      <Upload className="w-5 h-5" />
                      <span className="text-[10px] mt-1">Upload</span>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">{editRoom ? 'Update' : 'Create'} Room</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
