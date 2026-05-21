import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Edit } from 'lucide-react';
import { Product } from '../../services/productService';
import { useApp } from '../context/AppContext';
import { getFirstImage } from '../../utils/imageUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, user } = useApp();
  const navigate = useNavigate();

  const isInWishlist = wishlist.some(w => w._id === product._id);

  // Stable discount per product (based on id so it doesn't change on re-render)
  const discount = useMemo(() => {
    const seed = product._id ? product._id.charCodeAt(product._id.length - 1) % 15 : 5;
    return seed + 5;
  }, [product._id]);
  const originalPrice = Math.round(product.price * (1 + discount / 100));

  const isOwnProduct = user?.role === 'shopOwner' &&
    (typeof product.sellerId === 'object'
      ? (product.sellerId as any)._id === user._id
      : product.sellerId === user._id);

  // Shop owners only see their own products
  if (user?.role === 'shopOwner' && !isOwnProduct) return null;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/shop-owner/edit-product/${product._id}`);
  };

  const linkTo = isOwnProduct ? `/shop-owner/edit-product/${product._id}` : `/product/${product._id}`;

  return (
    <Link to={linkTo}>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-green-400 transition-all duration-200 group h-full flex flex-col">

        {/* Image */}
        <div className="relative h-36 sm:h-44 bg-gray-50 overflow-hidden flex-shrink-0">
          <img
            src={getFirstImage(product.images)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
          />

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xs bg-red-600 px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Discount badge — top left */}
          {product.stock > 0 && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {discount}% off
            </div>
          )}

          {/* Wishlist heart — top right (not for own products) */}
          {!isOwnProduct && (
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          {/* Brand */}
          <p className="text-xs text-green-600 font-semibold mb-0.5 truncate">{product.brand}</p>

          {/* Name */}
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 flex-1 leading-snug">{product.name}</h3>

          {/* Rating — only show if product has at least one review */}
          {(product.numReviews ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-md">
                <span>{(product.rating ?? 0).toFixed(1)}</span>
                <Star className="h-2.5 w-2.5 fill-white" />
              </div>
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
          </div>

          {/* Action button */}
          {isOwnProduct ? (
            <button
              onClick={handleEdit}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              <Edit className="h-4 w-4" /> Edit Product
            </button>
          ) : (
            <button
              onClick={handleCart}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-bold text-sm py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
