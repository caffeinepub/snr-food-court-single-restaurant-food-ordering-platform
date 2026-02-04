import { useEffect, useRef } from 'react';
import { useGetAllActiveOrders, useUpdateOrderStatus, useGetAllMenuItems, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bell, Clock, Phone, MapPin, Package, XCircle, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../backend';
import type { LiveOrder } from '../backend';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LiveOrdersView() {
  const { data: isAdmin = false, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: liveOrders = [], isLoading, isFetched, isError, error } = useGetAllActiveOrders(isAdmin);
  const { data: menuItems = [] } = useGetAllMenuItems();
  const updateOrderStatus = useUpdateOrderStatus();
  
  const hasLoadedOnceRef = useRef(false);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only process after the first successful fetch
    if (!isFetched || !isAdmin) return;

    if (!hasLoadedOnceRef.current) {
      // First load - just record the current order IDs
      hasLoadedOnceRef.current = true;
      previousOrderIdsRef.current = new Set(liveOrders.map(order => order.orderId));
      return;
    }

    // Subsequent loads - check for new orders
    const currentOrderIds = new Set(liveOrders.map(order => order.orderId));
    const newOrderIds = [...currentOrderIds].filter(id => !previousOrderIdsRef.current.has(id));

    if (newOrderIds.length > 0) {
      toast.success('New order received!', {
        description: `${newOrderIds.length} new order${newOrderIds.length > 1 ? 's' : ''} placed.`,
        icon: <Bell className="h-4 w-4" />,
      });
    }

    previousOrderIdsRef.current = currentOrderIds;
  }, [liveOrders, isFetched, isAdmin]);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.preparing: return 'Preparing';
      case OrderStatus.outForDelivery: return 'Out for Delivery';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
    }
  };

  const getStatusVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case OrderStatus.pending: return 'secondary';
      case OrderStatus.preparing: return 'default';
      case OrderStatus.outForDelivery: return 'default';
      case OrderStatus.delivered: return 'outline';
      case OrderStatus.cancelled: return 'destructive';
      default: return 'default';
    }
  };

  const getMenuItemName = (uuid: string) => {
    const item = menuItems.find(m => m.uuid === uuid);
    return item?.name || 'Unknown Item';
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus.mutate({ uuid: orderId, status });
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus.mutate({ uuid: orderId, status: OrderStatus.cancelled });
  };

  const formatTimestamp = (timestamp: bigint) => {
    // Backend uses Time.now() which returns nanoseconds
    // Convert nanoseconds to milliseconds for JavaScript Date
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    
    // Check if date is valid (not epoch/1970)
    if (date.getFullYear() < 2020) {
      return 'Just now';
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading while checking admin status
  if (isAdminLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view live orders. Only administrators can access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  // Show error if query failed
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Orders</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load live orders. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Live Orders</h2>
          <p className="text-muted-foreground">Active orders update automatically every 5 seconds</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Package className="h-4 w-4 mr-2" />
          {liveOrders.length} Active
        </Badge>
      </div>

      {liveOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No active orders at the moment</p>
            <p className="text-sm mt-2">New orders will appear here automatically</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {liveOrders.map((order: LiveOrder) => {
            const canCancel = order.status !== OrderStatus.delivered && order.status !== OrderStatus.cancelled;
            
            return (
              <Card key={order.orderId} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Order #{order.orderId.slice(-8)}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(order.orderTimestamp)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="text-muted-foreground font-medium min-w-[80px]">Customer:</div>
                      <div className="flex-1">{order.customerName}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">{order.customerPhone}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 text-sm">{order.deliveryAddress}</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="font-medium mb-2">Items:</div>
                    <ul className="space-y-1 text-sm">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{getMenuItemName(item.uuid)} × {Number(item.quantity)}</span>
                          <span className="text-muted-foreground">
                            ₹{Number(item.price) * Number(item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary">₹{Number(order.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateOrderStatus(order.orderId, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                        <SelectItem value={OrderStatus.preparing}>Preparing</SelectItem>
                        <SelectItem value={OrderStatus.outForDelivery}>Out for Delivery</SelectItem>
                        <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                        <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    {canCancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            disabled={updateOrderStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will mark the order as cancelled. The customer will be notified that their order has been cancelled.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep order</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, cancel order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
