import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { getDashboardStats } from '../../../services/adminService';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data.overview);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Platform overview and management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <Link to="/admin/farmers">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-green-100 p-2.5 sm:p-4 rounded-xl">
                <Users className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Farmers</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalFarmers}</p>
          </div>
        </Link>

        <Link to="/admin/shop-owners">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-blue-100 p-2.5 sm:p-4 rounded-xl">
                <Store className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Shop Owners</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalSellers}</p>
          </div>
        </Link>

        <Link to="/admin/products">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-purple-200 hover:border-purple-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-purple-100 p-2.5 sm:p-4 rounded-xl">
                <Package className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Products</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
          </div>
        </Link>

        <Link to="/admin/orders">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-orange-200 hover:border-orange-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-orange-100 p-2.5 sm:p-4 rounded-xl">
                <ShoppingBag className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
        </Link>

        <Link to="/admin/earnings">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-green-100 p-2.5 sm:p-4 rounded-xl">
                <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-1">Platform Revenue</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </Link>

        <Link to="/admin/reports">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 sm:p-6 shadow-lg text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl">
                <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <p className="text-white/80 text-xs sm:text-sm mb-1">Platform Status</p>
            <p className="text-2xl sm:text-3xl font-bold">Active</p>
            <p className="text-xs sm:text-sm text-white/70 mt-2">All systems operational</p>
          </div>
        </Link>
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Welcome to KrishakMart Admin Panel</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Manage your agricultural e-commerce platform efficiently. Monitor farmers, shop owners, products, and orders all in one place.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">Quick Actions</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• View and manage farmers</li>
              <li>• Approve shop applications</li>
              <li>• Monitor product listings</li>
            </ul>
          </div>
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">Platform Health</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• All services running</li>
              <li>• Database connected</li>
              <li>• API responsive</li>
            </ul>
          </div>
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">Recent Updates</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• Admin panel active</li>
              <li>• Real-time data sync</li>
              <li>• Analytics enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
