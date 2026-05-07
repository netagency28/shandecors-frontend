import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewCard({ review, onHelpful, canReport = false }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleHelpful = async () => {
    if (hasMarkedHelpful) return;
    
    setHasMarkedHelpful(true);
    setHelpfulCount(prev => prev + 1);
    
    if (onHelpful) {
      await onHelpful(review.id);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="border-b border-border pb-6 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{review.user?.name || 'Anonymous'}</p>
              {review.isVerified && (
                <CheckCircle size={14} className="text-green-600" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {renderStars(review.rating)}
              </div>
              <span className="text-xs text-foreground/60">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        {canReport && (
          <Button variant="ghost" size="sm" className="text-xs text-foreground/60 hover:text-foreground">
            Report
          </Button>
        )}
      </div>

      {review.comment && (
        <p className="text-foreground/80 leading-relaxed mb-4">
          {review.comment}
        </p>
      )}

      {review.adminReply ? (
        <div className="mb-4 pl-4 border-l-2 border-accent/40 bg-secondary/30 py-3 pr-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Shan Decor</p>
          <p className="text-foreground/90 text-sm leading-relaxed">{review.adminReply}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasMarkedHelpful}
          className={`text-xs ${hasMarkedHelpful ? 'text-accent' : 'text-foreground/60 hover:text-foreground'}`}
        >
          <ThumbsUp size={12} className="mr-1" />
          Helpful ({helpfulCount})
        </Button>
        
        {review.isVerified && (
          <Badge variant="secondary" className="text-xs">
            Verified Purchase
          </Badge>
        )}
      </div>
    </div>
  );
}
