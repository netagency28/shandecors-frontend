import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, MessageSquare, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { getAdminReviews, moderateAdminReview, replyAdminReview } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminReviews() {
  return (
    <AdminRoute>
      <AdminReviewsContent />
    </AdminRoute>
  );
}

function statusBadgeVariant(status) {
  if (status === 'APPROVED') return 'default';
  if (status === 'REJECTED') return 'destructive';
  return 'secondary';
}

function AdminReviewsContent() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyReview, setReplyReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySaving, setReplySaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (!search.trim()) {
      setDebouncedSearch('');
      return;
    }
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setActionError('');
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.moderationStatus = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await getAdminReviews(params);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, navigate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (reviewId, moderationStatus) => {
    try {
      setActionError('');
      await moderateAdminReview(reviewId, moderationStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, moderationStatus } : r)),
      );
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not update status');
    }
  };

  const openReply = (review) => {
    setReplyReview(review);
    setReplyText(review.adminReply || '');
    setReplyOpen(true);
  };

  const handleSaveReply = async () => {
    if (!replyReview) return;
    setReplySaving(true);
    setActionError('');
    try {
      const { data } = await replyAdminReview(replyReview.id, replyText);
      setReviews((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } : r)));
      setReplyOpen(false);
      setReplyReview(null);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not save reply');
    } finally {
      setReplySaving(false);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}
      />
    ));

  return (
    <AdminLayout
      title="Reviews"
      subtitle="Approve or reject customer reviews and post public replies"
    >
      <div className="max-w-[1300px]" data-testid="admin-reviews-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {actionError ? (
            <p className="text-sm text-destructive mb-4" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search by customer, product, or review text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-none"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] rounded-none">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary animate-pulse rounded-sm" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-sm border border-border">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No reviews match your filters.</p>
            </div>
          ) : (
            <div className="bg-background rounded-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Rating</th>
                      <th className="text-left p-4 font-medium min-w-[200px]">Review</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium min-w-[160px]">Store reply</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-t border-border align-top">
                        <td className="p-4">
                          <Link
                            to={`/products/${review.product?.slug}`}
                            className="font-medium hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {review.product?.name || '—'}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{review.user?.name || '—'}</p>
                          <p className="text-muted-foreground text-xs">{review.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        </td>
                        <td className="p-4 text-foreground/80 max-w-xs">
                          {review.comment ? (
                            <span className="line-clamp-4">{review.comment}</span>
                          ) : (
                            <span className="text-muted-foreground italic">No comment</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={statusBadgeVariant(review.moderationStatus)}>
                            {review.moderationStatus?.toLowerCase() || '—'}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground max-w-[200px]">
                          {review.adminReply ? (
                            <span className="line-clamp-3">{review.adminReply}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {review.moderationStatus === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="rounded-none h-8"
                                  onClick={() => handleModerate(review.id, 'APPROVED')}
                                >
                                  <Check size={14} className="mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-none h-8 border-destructive text-destructive hover:bg-destructive/10"
                                  onClick={() => handleModerate(review.id, 'REJECTED')}
                                >
                                  <X size={14} className="mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {review.moderationStatus === 'REJECTED' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-none h-8"
                                onClick={() => handleModerate(review.id, 'APPROVED')}
                              >
                                <Check size={14} className="mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-none h-8"
                              onClick={() => openReply(review)}
                            >
                              <MessageSquare size={14} className="mr-1" />
                              Reply
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Dialog
            open={replyOpen}
            onOpenChange={(open) => {
              setReplyOpen(open);
              if (!open) setReplyReview(null);
            }}
          >
            <DialogContent className="rounded-none sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Reply to review</DialogTitle>
                <DialogDescription>
                  This appears on the product page under the customer review when the review is approved.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Thank you for your feedback..."
                className="rounded-none resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">{replyText.length}/2000</p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => setReplyOpen(false)}
                  disabled={replySaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-none"
                  onClick={handleSaveReply}
                  disabled={replySaving}
                >
                  {replySaving ? 'Saving…' : 'Save reply'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
