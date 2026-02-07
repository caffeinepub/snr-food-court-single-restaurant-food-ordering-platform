import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Phone, MapPin, Package, Navigation, ExternalLink } from 'lucide-react';
import { OrderStatus } from '../backend';
import type { LiveOrder, MenuItem } from '../backend';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import OrderLocationMap from './OrderLocationMap';
import { buildExternalMapsUrl } from '../utils/externalMaps';

interface LiveOrderDetailsModalProps {
  order: LiveOrder | null;
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export default function LiveOrderDetailsModal({
  order,
  isOpen,
  onClose,
  menuItems,
}: LiveOrderDetailsModalProps) {
  if (!order) return null;

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

  const formatTimestamp = (timestamp: bigint) => {
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    
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

  const formatLocationUpdate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    
    const milliseconds = Number(timestamp) / 1_000_000;
    const date = new Date(milliseconds);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (secondsAgo < 5) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    return `${Math.floor(secondsAgo / 3600)}h ago`;
  };

  const hasLocation = order.currentLatitude !== undefined && order.currentLongitude !== undefined;
  const externalMapsUrl = hasLocation && order.currentLatitude !== undefined && order.currentLongitude !== undefined
    ? buildExternalMapsUrl(order.currentLatitude, order.currentLongitude)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Order #{order.orderId.slice(-8)}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" />
                {formatTimestamp(order.orderTimestamp)}
              </DialogDescription>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="text-base px-3 py-1">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-muted-foreground font-medium min-w-[100px]">Name:</div>
                  <div className="flex-1">{order.customerName}</div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">{order.customerPhone}</div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">{order.deliveryAddress}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Live Location Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Live Location
                </h3>
                {externalMapsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={externalMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in maps
                    </a>
                  </Button>
                )}
              </div>

              {hasLocation && order.currentLatitude !== undefined && order.currentLongitude !== undefined ? (
                <div className="space-y-4">
                  {/* Coordinates Display */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latitude:</span>
                        <span className="font-mono">{order.currentLatitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Longitude:</span>
                        <span className="font-mono">{order.currentLongitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-muted-foreground">Last updated:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatLocationUpdate(order.lastLocationUpdate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <OrderLocationMap
                    latitude={order.currentLatitude}
                    longitude={order.currentLongitude}
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-8 bg-muted/30 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Location not available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Waiting for customer to share location...
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h3>
              <div className="border rounded-lg p-4">
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span className="flex-1">
                        {getMenuItemName(item.uuid)} × {Number(item.quantity)}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        ₹{Number(item.price) * Number(item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-3" />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">₹{Number(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
