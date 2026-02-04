import { useState } from 'react';
import { useGetAllMenuItems, useGetAllOrders, useAddMenuItem, useUpdateOrderStatus, useDeleteMenuItem, useGetSingleRestaurant, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, UtensilsCrossed, Package, Trash2, Radio, AlertCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '../backend';
import type { MenuItem } from '../backend';
import LiveOrdersView from '../components/LiveOrdersView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SINGLE_RESTAURANT_UUID = 'snr-food-court';

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: isAdminLoading, isError } = useIsCallerAdmin();
  const { data: restaurant } = useGetSingleRestaurant();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const { data: orders = [] } = useGetAllOrders();
  const addMenuItem = useAddMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const updateOrderStatus = useUpdateOrderStatus();

  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);

  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: '',
    price: BigInt(0),
    isAvailable: true,
  });

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.description) {
      return;
    }

    const menuItem: MenuItem = {
      uuid: `menu-${Date.now()}`,
      restaurantUuid: SINGLE_RESTAURANT_UUID,
      name: newMenuItem.name,
      description: newMenuItem.description,
      category: newMenuItem.category || 'Main Course',
      price: newMenuItem.price || BigInt(0),
      isAvailable: newMenuItem.isAvailable ?? true,
      image: undefined,
    };

    addMenuItem.mutate(menuItem, {
      onSuccess: () => {
        setShowMenuItemDialog(false);
        setNewMenuItem({ name: '', description: '', category: '', price: BigInt(0), isAvailable: true });
      },
    });
  };

  const handleDeleteMenuItem = (uuid: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem.mutate(uuid);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus.mutate({ uuid: orderId, status });
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus.mutate({ uuid: orderId, status: OrderStatus.cancelled });
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.preparing: return 'Preparing';
      case OrderStatus.outForDelivery: return 'Out for Delivery';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
    }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Show loading state while checking admin status (but not on errors)
  if (isAdminLoading && !isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied only when verification succeeded and user is not admin
  if (!isAdminLoading && !isError && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin dashboard. Only administrators can view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage menu items and orders for {restaurant?.name || 'SNR Food Court'}</p>
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList>
          <TabsTrigger value="live">
            <Radio className="h-4 w-4 mr-2" />
            Live Orders
          </TabsTrigger>
          <TabsTrigger value="menu">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Menu Items
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            All Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          <LiveOrdersView />
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Menu Items ({menuItems.length})</h2>
            <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>Enter the menu item details below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      placeholder="e.g., Margherita Pizza"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Description *</Label>
                    <Textarea
                      id="itemDescription"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                      placeholder="Brief description of the item"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                      placeholder="e.g., Main Course, Dessert, Appetizer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={Number(newMenuItem.price)}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: BigInt(e.target.value || 0) })}
                      placeholder="149 (for ₹149)"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={newMenuItem.isAvailable}
                      onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, isAvailable: checked })}
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>
                  <Button onClick={handleAddMenuItem} disabled={addMenuItem.isPending} className="w-full">
                    {addMenuItem.isPending ? 'Adding...' : 'Add Menu Item'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {Object.keys(groupedMenuItems).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No menu items yet. Add your first item using the button above.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-3 capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <Card key={item.uuid}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMenuItem(item.uuid)}
                              disabled={deleteMenuItem.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                              ₹{Number(item.price)}
                            </p>
                            <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-semibold">All Orders ({orders.length})</h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                No orders yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const canCancel = order.status !== OrderStatus.delivered && order.status !== OrderStatus.cancelled;
                
                return (
                  <Card key={order.uuid}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Order {order.uuid}</CardTitle>
                          <CardDescription>
                            {order.items.length} item(s) • ₹{Number(order.totalPrice)}
                          </CardDescription>
                        </div>
                        <Badge>{getStatusLabel(order.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="ml-2">{order.customerName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="ml-2">{order.customerPhone}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="ml-2">{order.deliveryAddress}</span>
                          </div>
                          {order.userNotes && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Notes:</span>
                              <span className="ml-2">{order.userNotes}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.uuid, value as OrderStatus)}
                          >
                            <SelectTrigger className="w-[200px]">
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
                                    onClick={() => handleCancelOrder(order.uuid)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, cancel order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
