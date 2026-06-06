'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { reviewAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getInitials, formatDate } from '@/lib/utils';
import { Search, Plus, X, MessageSquare, Star } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });

  useEffect(() => { fetchReviews(); }, [page]);

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getAll({ page, limit: PAGE_SIZE });
      setReviews(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch { toast.error('Failed to load reviews');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingReview(null);
    setForm({ rating: 5, comment: '' });
    setShowModal(true);
  };

  const openEdit = (review: any) => {
    setEditingReview(review);
    setForm({ rating: review.rating, comment: review.comment || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await reviewAPI.update(editingReview.id, form);
        toast.success('Review updated');
      } else {
        await reviewAPI.create(form);
        toast.success('Review created');
      }
      setShowModal(false);
      fetchReviews();
    } catch { toast.error('Failed to save review'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
  };

  const filtered = reviews.filter((r) =>
    r.comment?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const isCustomer = user?.role === 'CUSTOMER';

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
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-gray-500 text-sm">Guest reviews and feedback</p>
        </div>
        {isCustomer && (
          <Button variant="gradient" className="flex items-center space-x-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>New Review</span>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
      </div>

      <div className="grid gap-4">
        {filtered.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    {getInitials(review.user?.fullName || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{review.user?.fullName || 'Anonymous'}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-400 mt-1">{review.comment}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    {review.hotel && <p className="text-xs text-gray-500">{review.hotel.name}</p>}
                    {review.room && <p className="text-xs text-gray-500">Room {review.room.roomNumber}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user?.id === review.userId && (
                  <button aria-label="Edit review" onClick={() => openEdit(review)}
                    className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                {(user?.id === review.userId || user?.role !== 'CUSTOMER') && (
                  <button aria-label="Delete review" onClick={() => handleDelete(review.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews found</p>
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
              className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingReview ? 'Edit Review' : 'New Review'}</h2>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Rating</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n} className="bg-[#0f172a]">{n} Star{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Comment</label>
                  <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]" required />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 text-white border-white/20" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1">{editingReview ? 'Update' : 'Submit'} Review</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
