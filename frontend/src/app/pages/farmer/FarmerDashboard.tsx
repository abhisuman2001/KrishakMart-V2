import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Package, ArrowRight } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { getProducts, Product } from '../../../services/productService';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import { getMyOrders } from '../../../services/orderService';
import { toast } from 'sonner';
import { translations } from '../../../utils/translations';

export const FarmerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const { cart, wishlist, language } = useApp();
  const t = translations[language];

  useEffect(() => {
    fetchProducts();
    fetchOrderCount();
  }, []);

  const fetchOrderCount = async () => {
    try {
      const data = await getMyOrders();
      setOrderCount(data.length);
    } catch {
      setOrderCount(0);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t.welcomeFarmer}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t.ordersHappening}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">{t.cartItems}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{cart.length}</p>
            </div>
            <div className="bg-green-100 p-2.5 sm:p-4 rounded-xl">
              <ShoppingBag className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>
        </div>

        <Link to="/farmer/orders" className="block bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">{t.myOrders}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                {orderCount === null ? '...' : orderCount}
              </p>
            </div>
            <div className="bg-orange-100 p-2.5 sm:p-4 rounded-xl">
              <Package className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-red-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">{t.wishlistItems}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{wishlist.length}</p>
            </div>
            <div className="bg-red-100 p-2.5 sm:p-4 rounded-xl">
              <Heart className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.availableProducts}</h2>
          <Link to="/shop">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 gap-1 sm:gap-2 text-sm px-3 sm:px-4">
              {t.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t.loadingProducts}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t.noProductsAvailable}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Products */}
      {!loading && products.length > 3 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">{t.moreProducts}</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.slice(3, 6).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
