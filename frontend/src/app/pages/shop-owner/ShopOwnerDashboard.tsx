import React, { useEffect, useState } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { getSellerProducts } from '../../../services/productService';
import { getSellerOrders } from '../../../services/orderService';
import { getSellerEarnings } from '../../../services/adminService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  ordersToday: number;
  pendingDeliveries: number;
  totalEarnings: number;
}

export const ShopOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    ordersToday: 0,
    pendingDeliveries: 0,
    totalEarnings: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const products = await getSellerProducts();
      
      // Fetch orders
      const orders = await getSellerOrders();
      
      // Fetch earnings
      const earnings = await getSellerEarnings();

      // Calculate today's orders and earnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayEarnings = todayOrders
        .filter((order: any) => order.orderStatus === 'Delivered')
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

      // Calculate pending deliveries (Pending + Accepted orders)
      const pendingDeliveries = orders.filter((order: any) => 
        order.orderStatus === 'Pending' || order.orderStatus === 'Accepted'
      ).length;

      // Calculate total earnings (all delivered orders)
      const totalEarnings = orders
        .filter((order: any) => order.orderStatus === 'Delivered')
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

      setStats({
        totalProducts: products.length,
        ordersToday: todayOrders.length,
        pendingDeliveries: pendingDeliveries,
        totalEarnings: totalEarnings
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-orange-600';
      case 'Accepted': return 'text-blue-600';
      case 'Packed': return 'text-purple-600';
      case 'Shipped': return 'text-indigo-600';
      case 'Delivered': return 'text-green-600';
      case 'Cancelled': return 'text-red-600';
      case 'Rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Monitor your shop's performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-green-100 p-2.5 sm:p-4 rounded-xl">
              <Package className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Products</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-100 p-2.5 sm:p-4 rounded-xl">
              <ShoppingBag className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Orders Today</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.ordersToday}</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-orange-100 p-2.5 sm:p-4 rounded-xl">
              <ShoppingBag className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.pendingDeliveries}</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-purple-100 p-2.5 sm:p-4 rounded-xl">
              <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Earnings</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">₹{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Recent Orders</h2>
          <button
            onClick={() => navigate('/shop-owner/orders')}
            className="text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No orders yet</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/shop-owner/orders`)}
                className="flex items-center justify-between p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.products.length} items · ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs sm:text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
