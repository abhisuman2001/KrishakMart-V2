import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, Shield, Tag, Sprout } from 'lucide-react';
import { getProducts, Product, categories } from '../../../services/productService';
import { useApp } from '../../context/AppContext';
import { translations } from '../../../utils/translations';
import { toast } from 'sonner';
import { ProductCard } from '../../components/ProductCard';

// ── Main Store Page ──
export const FarmerStorePage: React.FC = () => {
  const { user, language } = useApp();
  const t = translations[language];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  // sync URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) setSelectedCategory(cat);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-r from-[#2f7c4f] via-[#236240] to-[#1a4d30] text-white py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-green-200 text-xs sm:text-sm md:text-base">
              Discover quality farming products at the best prices
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-yellow-300" />
              <p className="text-[10px] sm:text-xs font-medium">Fast Delivery</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-yellow-300" />
              <p className="text-[10px] sm:text-xs font-medium">Genuine</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-yellow-300" />
              <p className="text-[10px] sm:text-xs font-medium">Best Prices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">

        {/* ── Shop by Category ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
              <p className="text-sm text-gray-500">Find everything you need for your farm</p>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group flex flex-col items-center gap-1 sm:gap-2 p-2.5 sm:p-4 rounded-xl border transition-all duration-200 text-center ${
                  selectedCategory === cat.id
                    ? 'border-green-400 bg-gradient-to-b from-green-100 to-white shadow-md'
                    : 'border-green-100 bg-gradient-to-b from-green-50 to-white hover:border-green-400 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold leading-tight transition-colors ${selectedCategory === cat.id ? 'text-green-700' : 'text-gray-700 group-hover:text-green-700'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Sort Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">{filtered.length} products</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-white">
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-72 animate-pulse">
                <div className="h-44 bg-gray-200 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
