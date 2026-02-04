import { useState, useEffect } from 'react';
import { useGetCartItems, useRemoveFromCart, usePlaceOrder, useGetSingleRestaurant, useGetCallerUserProfile, useGetAllMenuItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import type { Page } from '../App';

interface CartPageProps {
  onNavigate: (page: Page) => void;
}

const DELIVERY_FEE = 25;

export default function CartPage({ onNavigate }: CartPageProps) {
  const { data: cartItems = [], isLoading } = useGetCartItems();
  const { data: restaurant } = useGetSingleRestaurant();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const { data: userProfile } = useGetCallerUserProfile();
  const removeFromCart = useRemoveFromCart();
  const placeOrder = usePlaceOrder();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [userNotes, setUserNotes] = useState('');

  useEffect(() => {
    if (userProfile) {
      setCustomerName(userProfile.name || '');
      setCustomerPhone(userProfile.phone || '');
      setDeliveryAddress(userProfile.address || '');
    }
  }, [userProfile]);

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!deliveryAddress.trim() || !customerName.trim() || !customerPhone.trim()) {
      return;
    }
    placeOrder.mutate({ address: deliveryAddress, userNotes, customerName, customerPhone }, {
      onSuccess: () => {
        onNavigate('orders');
      },
    });
  };

  const getMenuItemName = (menuItemUuid: string) => {
    const item = menuItems.find(m => m.uuid === menuItemUuid);
    return item?.name || 'Menu Item';
  };

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
      <div className="mb-6">
        <Button variant="ghost" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8" />
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
            <Button onClick={() => onNavigate('home')}>Browse Menu</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              return (
                <Card key={item.menuItemUuid}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{getMenuItemName(item.menuItemUuid)}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {restaurant?.name || 'SNR Food Court'} • Quantity: {Number(item.quantity)}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          ₹{Number(item.price) * Number(item.quantity)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFromCart.mutate(item.menuItemUuid)}
                        disabled={removeFromCart.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹{DELIVERY_FEE}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalPrice + DELIVERY_FEE}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Your Name *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      type="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Any special requests or dietary restrictions?"
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={!deliveryAddress.trim() || !customerName.trim() || !customerPhone.trim() || placeOrder.isPending}
                  className="w-full"
                  size="lg"
                >
                  {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
