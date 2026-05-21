import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Calendar, Truck, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { getAllOrders } from '../../../services/adminService';

interface AdminOrder {
  _id: string;
  farmerId: {
    _id: string;
    name: string;
  };
  sellerId: {
    _id: string;
    name: string;
    shopName?: string;
  };
  products: Array<{
    productId: {
      _id: string;
      name?: string;
    };
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const orderId = o?._id ?? '';
    const farmerName = o?.farmerId?.name ?? 'Unknown';
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      orderId.toLowerCase().includes(search) ||
      farmerName.toLowerCase().includes(search);
    const status = (o?.orderStatus ?? '').toLowerCase();
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    switch ((status ?? '').toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'packed': return 'bg-purple-100 text-purple-700';
      case 'accepted': return 'bg-indigo-100 text-indigo-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch ((status ?? '').toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'packed': return <Clock className="h-4 w-4" />;
      case 'accepted': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Manage Orders</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track and monitor all transactions across the platform</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border-2 border-orange-200 shadow-sm flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-600">Total Orders:</span>
          <span className="text-lg font-bold text-orange-700">{orders.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border-2 border-green-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-3 sm:px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none font-medium text-gray-700 text-sm w-full sm:w-auto"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border-2 border-green-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-green-50 border-b-2 border-green-100">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Order ID</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Customer</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Items</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Amount</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-green-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="font-bold text-gray-800 text-sm">{order._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 text-sm truncate max-w-[100px]">{order.farmerId?.name ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="text-gray-700 text-sm">{order.products?.length ?? 0} items</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="font-bold text-green-700 text-sm">₹{(order.totalAmount ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase w-fit ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus ?? 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-center">
                      <button 
                        className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => toast.info('Order details coming soon')}
                      >
                        <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
