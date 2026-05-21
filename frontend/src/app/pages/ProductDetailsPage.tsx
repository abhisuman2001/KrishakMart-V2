import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, Star, Store, Minus, Plus, Check, ChevronLeft, ChevronRight,
  X, ZoomIn, Send, Shield, Truck, RotateCcw, Award, MapPin, Package,
  MessageCircle, ChevronDown, ChevronUp, Play, BadgeCheck, Leaf,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { getProduct, getProducts, Product } from '../../services/productService';
import { getProductReviews, addReview, checkCanReview, Review } from '../../services/reviewService';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getImageUrl } from '../../utils/imageUtils';
import { ProductCard } from '../components/ProductCard';

// ─── Pincode delivery estimator ───────────────────────────────────────────────
const PincodeChecker: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<null | { date: string; cod: boolean }>(null);
  const [checking, setChecking] = useState(false);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return; }
    setChecking(true);
    setTimeout(() => {
      const days = parseInt(pincode.slice(-1)) % 3 + 2; // 2–4 days deterministic
      const d = new Date(); d.setDate(d.getDate() + days);
      setResult({
        date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
        cod: parseInt(pincode[0]) % 2 === 0,
      });
      setChecking(false);
    }, 800);
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <MapPin className="h-4 w-4 text-[#2E7D32]" /> Check Delivery
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text" maxLength={6} value={pincode}
          onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setResult(null); }}
          placeholder="Enter pincode"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2E7D32]"
        />
        <button type="submit" disabled={checking}
          className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
          {checking ? '...' : 'Check'}
        </button>
      </form>
      {result && (
        <div className="space-y-1.5 text-sm">
          <p className="text-[#2E7D32] font-semibold flex items-center gap-1.5">
            <Truck className="h-4 w-4" /> Get it by {result.date}
          </p>
          <p className={`flex items-center gap-1.5 font-medium ${result.cod ? 'text-green-700' : 'text-gray-500'}`}>
            <Package className="h-4 w-4" />
            {result.cod ? 'Cash on Delivery Available' : 'Prepaid Only'}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Q&A Section ──────────────────────────────────────────────────────────────
interface QA { id: number; q: string; a: string | null; askedBy: string; date: string; }

const QASection: React.FC<{ productName: string; user: any }> = ({ productName, user }) => {
  const [questions, setQuestions] = useState<QA[]>([
    { id: 1, q: 'Is this product safe for organic farming?', a: 'Yes, this product is certified for use in organic farming as per Indian standards.', askedBy: 'Ramesh K.', date: '12 Mar 2025' },
    { id: 2, q: 'What is the shelf life after opening?', a: null, askedBy: 'Suresh P.', date: '18 Mar 2025' },
  ]);
  const [newQ, setNewQ] = useState('');
  const [expanded, setExpanded] = useState(false);

  const submitQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim()) return;
    setQuestions(prev => [...prev, {
      id: Date.now(), q: newQ.trim(), a: null,
      askedBy: user?.name || 'Anonymous', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }]);
    setNewQ('');
    toast.success('Question submitted!');
  };

  const visible = expanded ? questions : questions.slice(0, 2);

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-[#2E7D32]" /> Questions &amp; Answers
        <span className="text-sm font-normal text-gray-400">({questions.length})</span>
      </h2>

      {/* Ask a question */}
      <form onSubmit={submitQ} className="mb-6 flex gap-2">
        <input value={newQ} onChange={e => setNewQ(e.target.value)}
          placeholder={`Ask about ${productName}...`}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E7D32]" />
        <button type="submit"
          className="bg-[#2E7D32] hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
          <Send className="h-4 w-4" /> Ask
        </button>
      </form>

      <div className="space-y-4">
        {visible.map(qa => (
          <div key={qa.id} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-[#FF9800] font-bold text-sm mt-0.5">Q.</span>
              <div className="flex-1">
                <p className="text-gray-800 text-sm font-medium">{qa.q}</p>
                <p className="text-xs text-gray-400 mt-0.5">{qa.askedBy} · {qa.date}</p>
              </div>
            </div>
            {qa.a ? (
              <div className="flex items-start gap-2 ml-4 mt-2 bg-green-50 rounded-lg p-3">
                <span className="text-[#2E7D32] font-bold text-sm mt-0.5">A.</span>
                <p className="text-gray-700 text-sm">{qa.a}</p>
              </div>
            ) : (
              <p className="ml-4 mt-2 text-xs text-gray-400 italic">No answer yet</p>
            )}
          </div>
        ))}
      </div>

      {questions.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-4 text-[#2E7D32] text-sm font-semibold flex items-center gap-1 hover:underline">
          {expanded ? <><ChevronUp className="h-4 w-4" /> Show less</> : <><ChevronDown className="h-4 w-4" /> View all {questions.length} questions</>}
        </button>
      )}
    </div>
  );
};

// ─── Tab types ────────────────────────────────────────────────────────────────
type InfoTab = 'description' | 'specs' | 'usage' | 'safety';

// ─── Main Component ───────────────────────────────────────────────────────────
export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user, cart, updateCartQuantity } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<InfoTab>('description');
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean; hasPurchased: boolean; alreadyReviewed: boolean;
  }>({ canReview: false, hasPurchased: false, alreadyReviewed: false });

  useEffect(() => { if (id) load(id); }, [id]);

  useEffect(() => {
    if (product && user?.role === 'farmer') {
      checkCanReview(product._id).then(setReviewEligibility);
    }
  }, [product?._id, user?._id]);

  const load = async (pid: string) => {
    setLoading(true); setQuantity(1); setAddedToCart(false); setActiveImg(0);
    try {
      const [prod, all, revs] = await Promise.all([getProduct(pid), getProducts(), getProductReviews(pid)]);
      setProduct(prod); setReviews(revs);
      const similar = (all as Product[]).filter(p => p._id !== pid && p.category === prod.category).slice(0, 10);
      setSuggested(similar.length >= 4 ? similar : (all as Product[]).filter(p => p._id !== pid).slice(0, 10));
    } catch { toast.error('Failed to load product'); }
    finally { setLoading(false); }
  };

  const isInWishlist = wishlist.some(p => p._id === product?._id);

  const discount = useMemo(() => {
    if (!product) return 0;
    return (product._id.charCodeAt(product._id.length - 1) % 15) + 8;
  }, [product?._id]);

  const mrp = product ? Math.round(product.price * (1 + discount / 100)) : 0;
  const savings = mrp - (product?.price ?? 0);

  const shopName = product
    ? typeof product.sellerId === 'object' ? (product.sellerId.shopName || product.sellerId.name) : 'Unknown Seller'
    : '';

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAddedToCart(true); toast.success('Added to cart!');
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    // Add to cart (or update qty if already there), then go to checkout
    const existing = cart.find(i => i.product._id === product._id);
    if (existing) {
      await updateCartQuantity(product._id, quantity);
    } else {
      await addToCart(product);
      if (quantity > 1) await updateCartQuantity(product._id, quantity);
    }
    navigate('/checkout', { state: { buyNowIds: [product._id] } });
  };

  const handleWishlist = () => {
    if (!product) return;
    isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const images = product?.images?.length ? product.images : [];
  const prevImg = useCallback(() => setActiveImg(i => (i - 1 + images.length) % images.length), [images.length]);
  const nextImg = useCallback(() => setActiveImg(i => (i + 1) % images.length), [images.length]);

  // Hover-to-zoom magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await addReview(product!._id, { rating: reviewRating, comment: reviewComment.trim() });
      toast.success('Review submitted!');
      setReviewComment(''); setReviewRating(5);
      const [revs, updatedProd] = await Promise.all([getProductReviews(product!._id), getProduct(product!._id)]);
      setReviews(revs); setProduct(updatedProd);
      setReviewEligibility({ canReview: false, hasPurchased: true, alreadyReviewed: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
  }));

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImg();
      else if (e.key === 'ArrowRight') nextImg();
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prevImg, nextImg]);

  // ── Specs derived from product fields ──
  const specs = product ? [
    { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
    { label: 'Stock Available', value: `${product.stock} units` },
    { label: 'SKU', value: product._id.slice(-8).toUpperCase() },
    { label: 'Listed On', value: product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
  ] : [];

  const TABS: { id: InfoTab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications' },
    { id: 'usage', label: 'How to Use' },
    { id: 'safety', label: 'Safety' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Product not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#2E7D32] hover:underline">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Breadcrumb ── */}
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate('/')} className="hover:text-[#2E7D32] transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-[#2E7D32] transition-colors">Shop</button>
          <span>/</span>
          <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-[#2E7D32] transition-colors capitalize">{product.category}</button>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Hero: Image + Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">

          {/* ── Left: Image Gallery ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            {/* Main image with hover-zoom */}
            <div
              ref={imgRef}
              className="relative h-[380px] sm:h-[440px] bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in group"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomPos(null)}
              onClick={() => images.length > 0 && setLightbox(true)}
            >
              <img
                src={images.length > 0 ? getImageUrl(images[activeImg]) : '/placeholder-product.svg'}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-200"
                style={zoomPos ? { transform: `scale(1.8)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
              />

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom · Click to expand
              </div>

              {/* Trust badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.stock > 0 && (
                  <span className="bg-[#FF9800] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    {discount}% OFF
                  </span>
                )}
                {product.stock > 0 && product.stock < 20 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                    Low Stock
                  </span>
                )}
                {(product.numReviews ?? 0) >= 5 && (
                  <span className="bg-[#2E7D32] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Award className="h-3 w-3" /> Quality Assured
                  </span>
                )}
              </div>

              {/* Out of stock overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold bg-red-600 px-5 py-2.5 rounded-full text-sm">Out of Stock</span>
                </div>
              )}

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      activeImg === i ? 'border-[#2E7D32] shadow-md scale-105' : 'border-gray-200 hover:border-green-300 opacity-70 hover:opacity-100'
                    }`}>
                    <img src={getImageUrl(img)} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Shield, label: 'Secure Payment', color: 'text-blue-600' },
                { icon: RotateCcw, label: '7-Day Returns', color: 'text-[#FF9800]' },
                { icon: Leaf, label: 'Farm Fresh', color: 'text-[#2E7D32]' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-2.5 px-1">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product Info ── */}
          <div className="space-y-4">
            {/* Brand + Name */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-1">{product.brand}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {product.name}
                  </h1>
                </div>
                <button onClick={handleWishlist}
                  className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-all">
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Rating */}
              {(product.numReviews ?? 0) > 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#2E7D32] text-white text-sm px-3 py-1.5 rounded-lg font-bold">
                    {(product.rating ?? 0).toFixed(1)} <Star className="h-3.5 w-3.5 fill-white" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">{product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No reviews yet — be the first!</p>
              )}

              {/* Price block */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-extrabold text-[#2E7D32]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                  <span className="bg-[#FF9800] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Save ₹{savings.toLocaleString('en-IN')} ({discount}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                <p className={`text-sm mt-2 font-semibold ${product.stock > 20 ? 'text-[#2E7D32]' : product.stock > 0 ? 'text-[#FF9800]' : 'text-red-600'}`}>
                  {product.stock > 20
                    ? <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> In Stock</span>
                    : product.stock > 0
                    ? <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Only {product.stock} left — order soon!</span>
                    : <span className="flex items-center gap-1"><X className="h-4 w-4" /> Out of Stock</span>}
                </p>
              </div>

              {/* Seller card */}
              <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl p-3.5 hover:border-[#2E7D32] transition-colors cursor-pointer"
                onClick={() => navigate(`/shop/${typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Sold by</p>
                    <p className="font-bold text-gray-800 text-sm">{shopName}</p>
                    <p className="text-[10px] text-[#2E7D32] font-medium">Verified Seller · View Store →</p>
                  </div>
                </div>
                <BadgeCheck className="h-5 w-5 text-[#2E7D32] flex-shrink-0" />
              </div>

              {/* Quantity + Actions */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 shrink-0">Qty:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors">
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="px-5 py-2 font-bold text-base border-x border-gray-200 min-w-[48px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors">
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 active:scale-95 text-white font-bold text-sm py-4 rounded-2xl shadow-md transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none">
                  <ShoppingCart className="h-5 w-5" />
                  {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
                </button>
                <button onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-green-800 active:scale-95 text-white font-bold text-sm py-4 rounded-2xl shadow-md transition-all">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Pincode checker */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <PincodeChecker />
            </div>
          </div>
        </div>

        {/* ── Tabbed Info Section ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#2E7D32] text-[#2E7D32] bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {product.description || <span className="text-gray-400 italic">No description available.</span>}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {specs.map(({ label, value }, i) => (
                      <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-700 w-1/3">{label}</td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-5">
                {product.usage ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#2E7D32]" /> How to Use
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.usage}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Usage instructions not provided.</p>
                )}
                {/* Video placeholder */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 cursor-pointer hover:border-[#2E7D32] hover:bg-green-50 transition-colors group">
                  <div className="w-14 h-14 rounded-full bg-[#2E7D32]/10 group-hover:bg-[#2E7D32]/20 flex items-center justify-center transition-colors">
                    <Play className="h-7 w-7 text-[#2E7D32] fill-[#2E7D32]" />
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">How-to-Use Video Guide</p>
                  <p className="text-xs text-gray-400 text-center">Watch a step-by-step video on how to use this product effectively on your farm</p>
                  <span className="text-xs text-[#2E7D32] font-semibold border border-[#2E7D32] px-3 py-1 rounded-full">Coming Soon</span>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Storage', text: 'Store in a cool, dry place away from direct sunlight. Keep out of reach of children and pets.' },
                  { icon: Award, title: 'Handling', text: 'Wear protective gloves and eyewear when handling. Wash hands thoroughly after use.' },
                  { icon: Leaf, title: 'Environmental', text: 'Do not dispose near water bodies. Follow local agricultural waste disposal guidelines.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Icon className="h-5 w-5 text-[#FF9800] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
                      <p className="text-gray-600 text-sm">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Customer Reviews
            {reviews.length > 0 && <span className="text-sm font-normal text-gray-400">({reviews.length})</span>}
          </h2>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-5xl font-extrabold text-gray-800">{(product.rating ?? 0).toFixed(1)}</span>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 mt-1">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-right text-gray-600 font-medium">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-5 text-gray-500 text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review form — purchase-gated */}
          {reviewEligibility.canReview && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-5 bg-green-50 rounded-2xl border border-green-200">
              <h3 className="font-bold text-gray-800 mb-4">Write a Review</h3>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125">
                    <Star className={`h-7 w-7 transition-colors ${s <= (hoverRating || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || reviewRating]}
                </span>
              </div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2E7D32] resize-none bg-white" />
              <button type="submit" disabled={submittingReview}
                className="mt-3 bg-[#2E7D32] hover:bg-green-800 text-white rounded-xl px-6 py-2.5 gap-2 text-sm font-semibold flex items-center transition-colors disabled:opacity-60">
                <Send className="h-4 w-4" />
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {user?.role === 'farmer' && reviewEligibility.alreadyReviewed && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-[#2E7D32] flex items-center gap-2">
              <Check className="h-4 w-4" /> You have already reviewed this product.
            </div>
          )}

          {user?.role === 'farmer' && !reviewEligibility.hasPurchased && !reviewEligibility.alreadyReviewed && (
            <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 flex-shrink-0" />
              Purchase this product and receive it to leave a review.
            </div>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <Star className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">No reviews yet</p>
              <p className="text-sm mt-1 text-gray-400">Be the first to review this product after purchase</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] font-bold text-sm flex-shrink-0">
                        {(review.farmerName || (typeof review.farmerId === 'object' ? review.farmerId.name : 'U')).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">
                            {review.farmerName || (typeof review.farmerId === 'object' ? review.farmerId.name : 'Farmer')}
                          </p>
                          <span className="flex items-center gap-1 text-[10px] bg-green-100 text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold">
                            <BadgeCheck className="h-3 w-3" /> Verified Purchase
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Q&A ── */}
        <QASection productName={product.name} user={user} />

        {/* ── Suggested Products ── */}
        {suggested.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {suggested.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

      </div>

      {/* ── Lightbox ── */}
      {lightbox && images.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeImg + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prevImg(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <img src={getImageUrl(images[activeImg])} alt={product.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); nextImg(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}>
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
