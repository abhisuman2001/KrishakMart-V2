import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, ArrowLeft, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { getProductsBySeller, Product, categories } from '../../services/productService';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import API from '../../services/api';

interface SellerInfo {
  _id: string;
  name: string;
  shopName?: string;
  shopAddress?: string;
  phone?: string;
}

export const ShopPage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');

  useEffect(() => {
    if (sellerId) {
      fetchShopData();
    }
  }, [sellerId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      
      // Fetch products by seller
      const productsData = await getProductsBySeller(sellerId!);
      setProducts(productsData);
      
      // Get seller info from first product or fetch separately
      if (productsData.length > 0 && productsData[0].sellerId) {
        setSellerInfo(productsData[0].sellerId as any);
      } else {
        // Fetch seller info separately if no products
        const { data } = await API.get(`/users/${sellerId}`);
        setSellerInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  const shopName = sellerInfo?.shopName || sellerInfo?.name || 'Shop';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Shop Header */}
        <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-green-200 mb-6 md:mb-8">
          <div className="flex items-start gap-3 sm:gap-6">
            <div className="bg-green-100 p-3 sm:p-6 rounded-full flex-shrink-0">
              <Store className="h-7 w-7 sm:h-12 sm:w-12 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 truncate">{shopName}</h1>
              <div className="space-y-1.5 text-gray-600">
                {sellerInfo?.shopAddress && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{sellerInfo.shopAddress}</span>
                  </div>
                )}
                {sellerInfo?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{sellerInfo.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                  <span className="text-lg sm:text-2xl font-bold text-green-600">{products.length}</span>
                  <span className="text-gray-600 ml-2 text-sm">Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filters</span>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-[220px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-[220px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Store className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500">
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category' 
                : 'This shop has no products yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
