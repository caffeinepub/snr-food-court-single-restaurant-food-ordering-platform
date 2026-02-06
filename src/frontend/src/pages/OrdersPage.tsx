import { useEffect, useState } from 'react';
import { useGetUserOrders, useGetSingleRestaurant } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, AlertCircle } from 'lucide-react';
import type { OrderStatus } from '../backend';
import { useLiveLocationSharing } from '../hooks/useLiveLocationSharing';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5" />;
    case 'preparing':
      return <Package className="h-5 w-5" />;
    case 'outForDelivery':
      return <Truck className="h-5 w-5" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5" />;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'preparing':
      return 'bg-blue-500';
    case 'outForDelivery':
      return 'bg-purple-500';
    case 'delivered':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'preparing':
      return 'Preparing';
    case 'outForDelivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
  }
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetUserOrders();
  const { data: restaurant } = useGetSingleRestaurant();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Check for newly placed order on mount
  useEffect(() => {
    const storedOrderId = sessionStorage.getItem('activeOrderId');
    if (storedOrderId) {
      setActiveOrderId(storedOrderId);
    }
  }, []);

  // Check if the active order is still active (not delivered/cancelled)
  useEffect(() => {
    if (activeOrderId && orders.length > 0) {
      const order = orders.find(o => o.uuid === activeOrderId);
      if (order && (order.status === 'delivered' || order.status === 'cancelled')) {
        // Order is complete, stop tracking
        sessionStorage.removeItem('activeOrderId');
        setActiveOrderId(null);
      }
    }
  }, [orders, activeOrderId]);

  // Start live location sharing for active order
  const locationState = useLiveLocationSharing({
    orderId: activeOrderId,
    enabled: !!activeOrderId,
  });

  const sortedOrders = [...orders].sort((a, b) => Number(b.orderTimestamp) - Number(a.orderTimestamp));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Package className="h-8 w-8" />
        Your Orders
      </h1>

      {/* Location sharing status */}
      {activeOrderId && locationState.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Sharing Unavailable</AlertTitle>
          <AlertDescription>{locationState.error}</AlertDescription>
        </Alert>
      )}

      {activeOrderId && locationState.isSharing && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">Live Location Sharing Active</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your location is being shared with the restaurant for order delivery tracking.
          </AlertDescription>
        </Alert>
      )}

      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">Start ordering delicious food from our menu!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            return (
              <Card key={order.uuid}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order from {restaurant?.name || 'SNR Food Court'}
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusLabel(order.status)}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>Order ID: {order.uuid}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₹{Number(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span>{order.items.length} item(s)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Address:</span>
                      <span className="text-right max-w-xs">{order.deliveryAddress}</span>
                    </div>
                    {order.userNotes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Special Instructions:</span>
                        <span className="text-right max-w-xs">{order.userNotes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
