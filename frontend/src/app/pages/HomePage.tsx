import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingBag, Store, ArrowRight, CheckCircle,
  Package, Clock, Truck, Shield, Tag, Zap,
  UserPlus, ShoppingCart, Home, Tractor, Sprout, Gift,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { categories, getProducts, getSellerProducts, Product } from '../../services/productService';
import { getSellerOrders } from '../../services/orderService';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/badge';
import { translations } from '../../utils/translations';
import { ProductCard } from '../components/ProductCard';


export const HomePage: React.FC = () => {
  const { user, language } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.role === 'shopOwner') {
          const [sellerProducts, orders] = await Promise.all([
            getSellerProducts(),
            getSellerOrders(),
          ]);
          setProducts(sellerProducts);
          setPendingOrders(orders.filter((o: any) => o.orderStatus === 'Pending' || o.orderStatus === 'Accepted'));
        } else {
          const data = await getProducts();
          setProducts(data);
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // ── SHOP OWNER VIEW (unchanged) ──
  if (user?.role === 'shopOwner') {
    return (
      <div>
        {/* Hero */}
        <section className="relative h-[250px] sm:h-[350px] bg-gradient-to-r from-[#2f7c4f] to-[#236240] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920')] bg-cover bg-center opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl space-y-2 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">KrishakMart</h1>
              <p className="text-base sm:text-xl font-semibold text-[#f5ede3] italic">Mitti Se Digital Tak</p>
              <p className="text-sm sm:text-base text-green-100">Manage your shop and grow your business.</p>
            </div>
          </div>
        </section>

        {/* My Products */}
        <section className="py-8 sm:py-12 bg-gradient-to-b from-[#f0f9f4] to-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex justify-between items-center mb-5 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{t.myProductsSection}</h2>
                <p className="text-gray-600 text-sm">Manage your product inventory</p>
              </div>
              <Link to="/shop-owner/products">
                <Button variant="outline" className="border-2 border-[#2f7c4f] text-[#2f7c4f] hover:bg-[#f0f9f4] gap-1 sm:gap-2 font-semibold text-sm px-3 sm:px-4">
                  {t.viewAll} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-12"><p className="text-gray-600">{t.loading}</p></div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-4">{t.noProducts}</p>
                <Link to="/shop-owner/add-product">
                  <Button className="bg-green-600 hover:bg-green-700">{t.addFirstProduct}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {products.slice(0, 4).map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pending Orders */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex justify-between items-center mb-5 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{t.pendingOrdersSection}</h2>
                <p className="text-gray-600 text-sm">Orders waiting for your action</p>
              </div>
              <Link to="/shop-owner/orders">
                <Button variant="outline" className="border-2 border-[#2f7c4f] text-[#2f7c4f] hover:bg-[#f0f9f4] gap-1 sm:gap-2 font-semibold text-sm px-3 sm:px-4">
                  {t.viewAllOrders} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-12"><p className="text-gray-600">{t.loading}</p></div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">{t.noPendingOrders}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {pendingOrders.slice(0, 4).map(order => (
                  <div key={order._id} className="bg-white rounded-xl p-4 md:p-6 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">{t.orderID} #{order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-600">{order.farmerId?.name || t.customer}</p>
                      </div>
                      <Badge className={`text-xs ${order.orderStatus === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {order.orderStatus === 'Pending' ? t.pending : t.accepted}
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <p><span className="font-semibold">{t.items}:</span> {order.products.length}</p>
                      <p><span className="font-semibold">{t.total}:</span> ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Link to="/shop-owner/orders">
                      <Button className="w-full bg-green-600 hover:bg-green-700">{t.viewDetails}</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── GUEST VIEW (Flipkart style) ──
  return (
    <div className="bg-gray-50">

      {/* ── Hero with Search ── */}
      <section className="bg-gradient-to-r from-[#2f7c4f] via-[#236240] to-[#1a4d30] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-10 sm:py-16 md:py-24">
          <div className="text-center mb-7 sm:mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-10 w-10 sm:h-14 sm:w-14" />
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-none">KrishakMart</h1>
                <p className="text-green-200 italic text-base sm:text-lg">Mitti Se Digital Tak</p>
              </div>
            </div>
            <p className="text-green-100 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Quality agricultural products delivered directly to farmers. Save time, grow better.
            </p>

            {/* Search Bar */}
            <form id="hero-search-bar" onSubmit={handleSearch} className="max-w-2xl mx-auto flex shadow-xl rounded-xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search seeds, fertilizers, tools..."
                className="flex-1 px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-800 outline-none bg-white min-w-0"
              />
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-4 sm:px-6 py-3 sm:py-4 transition-colors font-semibold text-gray-900 flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            {[
              { icon: Truck, label: 'Fast Delivery' },
              { icon: Shield, label: 'Genuine Products' },
              { icon: Tag, label: 'Best Prices' },
              { icon: Zap, label: 'Easy Returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Shop by Category</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Find everything you need for your farm</p>
            </div>
            <Link to="/shop" className="text-[#2f7c4f] font-semibold text-xs sm:text-sm flex items-center gap-1 hover:underline flex-shrink-0">
              View All <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {categories.map(cat => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`}>
                <div className="bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-100 p-2.5 sm:p-4 text-center hover:border-green-400 hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${cat.bg} rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-200`}>
                    <cat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${cat.color}`} />
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-700 group-hover:text-green-700 transition-colors leading-tight">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Top quality farming supplies</p>
            </div>
            <Link to="/shop" className="text-[#2f7c4f] font-semibold text-xs sm:text-sm flex items-center gap-1 hover:underline flex-shrink-0">
              View All <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-gray-600">No products available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.slice(0, 10).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/shop">
              <Button size="lg" className="bg-[#2f7c4f] hover:bg-[#236240] text-white px-10 py-5 gap-2 font-semibold">
                View All Products <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Seasonal Offer Banner ── */}
      <section className="py-8 sm:py-10 bg-gradient-to-r from-[#b87a47] to-[#855132]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Seasonal Sale — Up to 30% Off!</h2>
              <p className="text-white/90 text-sm sm:text-base">Special discounts on seeds and fertilizers this season</p>
            </div>
          </div>
          <Link to="/signup/farmer" className="flex-shrink-0">
            <Button size="lg" className="bg-white text-[#b87a47] hover:bg-[#f5ede3] font-semibold px-6 sm:px-8 py-4 sm:py-5">
              Sign Up &amp; Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* ── How to Order ── */}
      <section className="py-12 sm:py-16 bg-[#2f7c4f] text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">How to Order</h2>
            <p className="text-green-100 text-base sm:text-lg">Simple steps to get your farming supplies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
            {[
              { step: '1', title: 'Create Account',   desc: 'Sign up as a farmer for free',          icon: UserPlus },
              { step: '2', title: 'Browse Products',  desc: 'Search and select farming supplies',    icon: Search },
              { step: '3', title: 'Add to Cart',      desc: 'Choose quantity and place order',       icon: ShoppingCart },
              { step: '4', title: 'Receive at Home',  desc: 'Get products at your doorstep',         icon: Home },
            ].map(item => (
              <div key={item.step} className="text-center group">
                <div className="bg-white text-[#2f7c4f] rounded-full w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2f7c4f]" />
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                  <div className="text-yellow-300 font-bold text-xs sm:text-sm mb-1">Step {item.step}</div>
                  <h3 className="text-sm sm:text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-green-100 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/signup/farmer">
              <Button size="lg" className="w-full sm:w-auto bg-white text-[#2f7c4f] hover:bg-green-50 hover:scale-105 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold shadow-lg gap-2">
                <Tractor className="h-5 w-5" /> Sign Up as Farmer
              </Button>
            </Link>
            <Link to="/become-seller">
              <Button size="lg" className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-gray-900 hover:scale-105 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold shadow-lg gap-2">
                <Store className="h-5 w-5" /> Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
