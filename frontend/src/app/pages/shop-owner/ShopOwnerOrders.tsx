import React, { useState, useEffect } from 'react';
import { getSellerOrders, updateOrderStatus, Order } from '../../../services/orderService';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MapPin, Phone, User, Package, Calendar, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { getImageUrl } from '../../../utils/imageUtils';

export const ShopOwnerOrders: React.FC = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): string => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Accepted');
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Delivered');
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await updateOrderStatus(orderId, 'Cancelled');
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-500';
      case 'Accepted': return 'bg-blue-500';
      case 'Delivered': return 'bg-green-600';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.orderStatus === status);
  };

  const renderOrderCard = (order: any) => {
    const shopLat = user?.shopLocation?.latitude;
    const shopLon = user?.shopLocation?.longitude;
    const farmerLat = order.deliveryAddress?.latitude;
    const farmerLon = order.deliveryAddress?.longitude;
    const distance = calculateDistance(shopLat, shopLon, farmerLat, farmerLon);

    return (
      <div key={order._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-2 border-green-200 hover:border-green-400 transition-all">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <Badge className={`${getStatusColor(order.orderStatus)} px-3 py-1.5 text-xs sm:text-sm self-start sm:self-auto`}>
            {order.orderStatus}
          </Badge>
        </div>

        {/* Farmer Details */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Farmer Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{order.farmerId?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 text-sm sm:text-base">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {order.farmerId?.phone || 'N/A'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Delivery Address</p>
              <p className="font-medium text-gray-800 flex items-start gap-1.5 text-sm sm:text-base">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>{order.deliveryAddress?.fullAddress || 'N/A'}</span>
              </p>
            </div>
            {farmerLat && farmerLon && (
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Location Coordinates</p>
                <p className="font-medium text-gray-700 text-xs sm:text-sm">
                  Lat: {farmerLat.toFixed(6)}, Lon: {farmerLon.toFixed(6)}
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Distance from Shop</p>
              <p className="font-bold text-green-700 flex items-center gap-1.5 text-base sm:text-lg">
                <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                {distance}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Products Ordered
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {order.products.map((item: any, index: number) => (
              <div key={index} className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.productName}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.productName}</h5>
                  <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-xs sm:text-sm font-semibold text-green-700">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-xl sm:text-2xl font-bold text-green-700">₹{order.totalAmount.toLocaleString('en-IN')}</p>
          </div>

          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {order.orderStatus === 'Pending' && (
              <>
                <Button
                  onClick={() => handleAcceptOrder(order._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-sm px-3 sm:px-4"
                >
                  Accept Order
                </Button>
                <Button
                  onClick={() => handleCancelOrder(order._id)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 text-sm px-3 sm:px-4"
                >
                  Cancel
                </Button>
              </>
            )}
            {order.orderStatus === 'Accepted' && (
              <Button
                onClick={() => handleMarkDelivered(order._id)}
                className="bg-green-600 hover:bg-green-700 text-sm px-3 sm:px-4"
              >
                Mark as Delivered
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Loading orders...</p>
      </div>
    );
  }

  const pendingOrders = filterOrdersByStatus('Pending');
  const acceptedOrders = filterOrdersByStatus('Accepted');
  const deliveredOrders = filterOrdersByStatus('Delivered');
  const cancelledOrders = filterOrdersByStatus('Cancelled');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Orders Received</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage orders from farmers ({orders.length} total)</p>
      </div>

      {!user?.shopLocation?.latitude || !user?.shopLocation?.longitude ? (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-800 mb-2">Shop Location Required</h3>
              <p className="text-orange-700 mb-3">
                Please set your shop location in your profile to see accurate distances to farmers.
              </p>
              <Button
                onClick={() => window.location.href = '/shop-owner/profile'}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-green-200">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No orders received yet</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8">
            <TabsTrigger value="Pending" className="text-xs sm:text-base">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="Accepted" className="text-xs sm:text-base">
              Accepted ({acceptedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="Delivered" className="text-xs sm:text-base">
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="Cancelled" className="text-xs sm:text-base">
              Cancelled ({cancelledOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Pending" className="space-y-6">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-gray-600">No pending orders</p>
              </div>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </TabsContent>

          <TabsContent value="Accepted" className="space-y-6">
            {acceptedOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-gray-600">No accepted orders</p>
              </div>
            ) : (
              acceptedOrders.map(renderOrderCard)
            )}
          </TabsContent>

          <TabsContent value="Delivered" className="space-y-6">
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-gray-600">No delivered orders</p>
              </div>
            ) : (
              deliveredOrders.map(renderOrderCard)
            )}
          </TabsContent>

          <TabsContent value="Cancelled" className="space-y-6">
            {cancelledOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-gray-600">No cancelled orders</p>
              </div>
            ) : (
              cancelledOrders.map(renderOrderCard)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
