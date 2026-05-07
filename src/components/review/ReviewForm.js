import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';

export default function ReviewForm({ productId, existingReview, onSubmit, onCancel }) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        productId,
        rating,
        comment: comment.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (interactive = true) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (interactive ? rating : existingReview?.rating || 0);
      
      return (
        <Star
          key={i}
          size={interactive ? 24 : 16}
          className={`cursor-pointer transition-colors ${
            interactive && hoveredRating >= starValue ? 'text-yellow-400 fill-yellow-400' : ''
          } ${
            isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 bg-secondary/20 rounded-sm">
        <p className="text-foreground/70 mb-4">Please log in to leave a review</p>
        <Button onClick={() => window.location.href = '/login'}>
          Log In to Review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Rating</label>
        <div className="flex gap-1">
          {renderStars()}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Review (optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1"
        >
          {isSubmitting 
            ? (existingReview ? 'Updating...' : 'Submitting...') 
            : (existingReview ? 'Update Review' : 'Submit Review')
          }
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
