import { useState, useEffect, useCallback } from 'react';
import { Star, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ReviewCard from './ReviewCard';
import { getProductReviews } from '../../lib/api';

export default function ReviewsList({ productId, onReviewUpdate, onStatsLoad }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    rating: 'all',
    sort: 'recent'
  });

  const fetchReviews = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pageNum,
        limit: 5,
        ...(filters.rating !== 'all' && { rating: filters.rating }),
      };

      const response = await getProductReviews(productId, params);
      
      if (reset) {
        setReviews(response.data.reviews);
      } else {
        setReviews(prev => [...prev, ...response.data.reviews]);
      }
      
      setStats(response.data.stats);
      setHasMore(pageNum < response.data.pagination.pages);
      if (pageNum === 1 && response.data.stats) {
        onStatsLoad?.({ total: response.data.stats.totalReviews, avg: response.data.stats.averageRating });
      }
      
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, filters.rating]);

  useEffect(() => {
    fetchReviews(1, true);
    setPage(1);
  }, [fetchReviews]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, false);
    }
  };

  const renderStars = (rating, size = 'small') => {
    const starSize = size === 'large' ? 20 : 14;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={starSize}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const renderRatingBars = () => {
    if (!stats) return null;

    const bars = [5, 4, 3, 2, 1].map(rating => {
      const count = stats.ratingDistribution.find(r => r.rating === rating)?.count || 0;
      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
      
      return (
        <div key={rating} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-16">
            <span className="text-sm">{rating}</span>
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-foreground/60 w-8 text-right">{count}</span>
        </div>
      );
    });

    return bars;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 bg-secondary rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-secondary rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-secondary rounded w-1/6"></div>
              </div>
            </div>
            <div className="h-16 bg-secondary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchReviews(1, true)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {stats && (
        <div className="bg-secondary/20 p-6 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-display mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {renderStars(stats.averageRating, 'large')}
              </div>
              <p className="text-sm text-foreground/60">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="font-medium mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {renderRatingBars()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-foreground/60">
          {reviews.length} of {stats?.totalReviews || 0} reviews
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-sm">
          <Star className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <p className="text-foreground/60">No reviews yet</p>
          <p className="text-sm text-foreground/40 mt-2">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onReviewUpdate={onReviewUpdate}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="rounded-none"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}
