import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Star } from 'lucide-react';
import { getMyOrders, Order } from '../../../services/orderService';
import { addReview, getProductReviews } from '../../../services/reviewService';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { getImageUrl } from '../../../utils/imageUtils';
import { translations } from '../../../utils/translations';
import { useApp } from '../../context/AppContext';

// --- Star Rating Component ---
const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({
  value, onChange, readonly = false,
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// --- Review Section for one product ---
const ProductReviewSection: React.FC<{ productId: string; productName: string; userId: string }> = ({
  productId, productName, userId,
}) => {
  const [existingReview, setExistingReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getProductReviews(productId)
      .then((reviews) => {
        const mine = reviews.find((r: any) => r.farmerId?._id === userId || r.farmerId === userId);
        if (mine) setExistingReview(mine);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [productId, userId]);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (!comment.trim()) { toast.error('Please write a review comment'); return; }
    try {
      setSubmitting(true);
      const review = await addReview(productId, { rating, comment: comment.trim() });
      setExistingReview(review);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!checked) return null;

  if (existingReview) {
    return (
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-yellow-700 mb-1">Your Review</p>
        <StarRating value={existingReview.rating} readonly />
        <p className="text-sm text-gray-700 mt-1">{existingReview.comment}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-2">
      <p className="text-xs font-semibold text-green-700">Rate this product</p>
      <StarRating value={rating} onChange={setRating} />
      <Textarea
        placeholder={`Share your experience with ${productName}...`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="text-sm border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[70px] resize-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="sm"
        className="bg-green-700 hover:bg-green-800 text-white rounded-lg gap-1.5"
      >
        <Star className="h-3.5 w-3.5" />
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
};

// --- Main Orders Page ---
export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, user } = useApp();
  const t = translations[language];

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Packed': return <Package className="h-5 w-5" />;
      case 'Shipped': return <Truck className="h-5 w-5" />;
      case 'Delivered': return <CheckCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Packed': return 'bg-blue-500';
      case 'Shipped': return 'bg-orange-500';
      case 'Delivered': return 'bg-green-600';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-xl text-gray-600">{t.loadingOrders}</p></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t.myOrdersTitle}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t.trackOrders} ({orders.length} {t.total})</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-green-200">
          <p className="text-lg sm:text-xl text-gray-600">{t.noOrdersYet}</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-2 sm:gap-0">
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1">Order #{order._id.slice(-8)}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{t.placedOn} {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge className={`${getStatusColor(order.orderStatus)} flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm self-start sm:self-auto`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus}
                </Badge>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-4 sm:mb-6">
                {order.products.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-3 sm:gap-4">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.productName}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.productName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{t.quantity}: {item.quantity}</p>
                        <p className="text-sm font-semibold text-green-700">₹{item.price * item.quantity}</p>
                      </div>
                    </div>

                    {/* Review section — only for delivered orders */}
                    {order.orderStatus === 'Delivered' && user && (
                      <ProductReviewSection
                        productId={item.productId}
                        productName={item.productName}
                        userId={user._id}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-gray-200 gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">{t.deliveryAddress}</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base break-words">
                    {typeof order.deliveryAddress === 'string'
                      ? order.deliveryAddress
                      : order.deliveryAddress?.fullAddress || 'N/A'}
                  </p>
                  {order.deliveryAddress?.phone && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Phone: {order.deliveryAddress.phone}</p>
                  )}
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm text-gray-600">{t.paymentMethod}</p>
                  <p className="font-medium text-gray-800 mb-1 sm:mb-2 text-sm">{order.paymentMethod}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{t.totalAmount}</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">₹{order.totalAmount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
