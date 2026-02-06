import { useState, useEffect } from 'react';
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
import { Shield, Plus, UtensilsCrossed, Package, Trash2, Radio, AlertCircle, XCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { OrderStatus, ExternalBlob } from '../backend';
import type { MenuItem } from '../backend';
import LiveOrdersView from '../components/LiveOrdersView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateImageFile, fileToBytes, createPreviewUrl, revokePreviewUrl } from '../utils/menuItemImage';
import { toast } from 'sonner';

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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: '',
    price: BigInt(0),
    isAvailable: true,
  });

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        revokePreviewUrl(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Clear previous preview
    if (imagePreviewUrl) {
      revokePreviewUrl(imagePreviewUrl);
    }

    // Set new image
    setSelectedImageFile(file);
    setImagePreviewUrl(createPreviewUrl(file));
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) {
      revokePreviewUrl(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setUploadProgress(0);
  };

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined = undefined;

      // Upload image if selected
      if (selectedImageFile) {
        const imageBytes = await fileToBytes(selectedImageFile);
        imageBlob = ExternalBlob.fromBytes(imageBytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const menuItem: MenuItem = {
        uuid: `menu-${Date.now()}`,
        restaurantUuid: SINGLE_RESTAURANT_UUID,
        name: newMenuItem.name,
        description: newMenuItem.description,
        category: newMenuItem.category || 'Main Course',
        price: newMenuItem.price || BigInt(0),
        isAvailable: newMenuItem.isAvailable ?? true,
        image: imageBlob,
      };

      addMenuItem.mutate(menuItem, {
        onSuccess: () => {
          setShowMenuItemDialog(false);
          setNewMenuItem({ name: '', description: '', category: '', price: BigInt(0), isAvailable: true });
          handleClearImage();
          setUploadProgress(0);
        },
        onError: () => {
          setUploadProgress(0);
        },
      });
    } catch (error) {
      toast.error('Failed to process image');
      setUploadProgress(0);
    }
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
            <Dialog open={showMenuItemDialog} onOpenChange={(open) => {
              setShowMenuItemDialog(open);
              if (!open) {
                handleClearImage();
                setNewMenuItem({ name: '', description: '', category: '', price: BigInt(0), isAvailable: true });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Food Image (Optional)</Label>
                    <div className="space-y-3">
                      {!imagePreviewUrl ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
                          <label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                            <div className="rounded-full bg-muted p-3">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Click to upload image</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPEG, PNG, or WebP (max 5MB)
                              </p>
                            </div>
                            <Input
                              id="image"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleClearImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-white text-center mt-1">
                                Uploading... {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {imagePreviewUrl && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span>{selectedImageFile?.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearImage}
                            className="ml-auto"
                          >
                            Replace
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={newMenuItem.isAvailable}
                      onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, isAvailable: checked })}
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>
                  <Button 
                    onClick={handleAddMenuItem} 
                    disabled={addMenuItem.isPending || (uploadProgress > 0 && uploadProgress < 100)} 
                    className="w-full"
                  >
                    {addMenuItem.isPending ? 'Adding...' : uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Add Menu Item'}
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
                      <Card key={item.uuid} className="overflow-hidden">
                        {item.image && (
                          <div className="relative h-40 overflow-hidden bg-muted">
                            <img
                              src={item.image.getDirectURL()}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
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
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-primary">
                                ₹{Number(item.price)}
                              </p>
                              <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            {!item.image && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                <span>No photo uploaded</span>
                              </div>
                            )}
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
