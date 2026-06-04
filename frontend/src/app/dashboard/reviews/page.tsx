'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reviewAPI } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-gray-500 text-sm">Guest reviews and feedback</p>
      </div>

      <div className="grid gap-4">
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(review.user?.fullName || 'U')}
                </div>
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
                  <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {(user?.id === review.userId || user?.role !== 'CUSTOMER') && (
                <button aria-label="Delete review" onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews yet</p>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
