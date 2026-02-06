import { useState, useMemo } from 'react';
import { useGetSingleRestaurant, useGetAllMenuItems, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { MenuItem } from '../backend';
import { ensureRequiredMenuItems } from '../utils/requiredMenuItems';

const SINGLE_RESTAURANT_UUID = 'snr-food-court';

// Map specific menu items to their images
const menuItemImageMap: Record<string, string> = {
  'veg-manchuria': '/assets/generated/veg-manchuria.dim_300x300.jpg',
  'veg_manuhair': '/assets/generated/veg-manchuria.dim_300x300.jpg',
  'chicken-manchuria': '/assets/generated/chicken-manchuria.dim_300x300.jpg',
  'chicken-65': '/assets/generated/chicken-65.dim_300x300.jpg',
  'chilly-chicken': '/assets/generated/chilly-chicken-photo.dim_300x300.jpg',
  'chicken-555': '/assets/generated/chicken-555-photo.dim_300x300.jpg',
};

// Fallback images for items without specific images
const fallbackImages = [
  '/assets/generated/pizza-margherita.dim_300x300.jpg',
  '/assets/generated/chicken-tikka.dim_300x300.jpg',
  '/assets/generated/sushi-platter.dim_300x300.jpg',
  '/assets/generated/burger-fries.dim_300x300.jpg',
  '/assets/generated/pad-thai.dim_300x300.jpg',
  '/assets/generated/caesar-salad.dim_300x300.jpg',
  '/assets/generated/chocolate-brownie.dim_300x300.jpg',
  '/assets/generated/fruit-smoothie.dim_300x300.jpg',
];

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: restaurant, isLoading: restaurantLoading } = useGetSingleRestaurant();
  const { data: fetchedMenuItems = [], isLoading: menuLoading } = useGetAllMenuItems();
  const addToCart = useAddToCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Ensure required menu items are present
  const menuItems = useMemo(() => {
    return ensureRequiredMenuItems(fetchedMenuItems);
  }, [fetchedMenuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(menuItems.map(item => item.category));
    return Array.from(categories).sort();
  }, [menuItems]);

  const groupedMenuItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    filteredMenuItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredMenuItems]);

  const handleAddToCart = (item: MenuItem) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    addToCart.mutate({
      restaurantUuid: SINGLE_RESTAURANT_UUID,
      menuItemUuid: item.uuid,
      quantity: BigInt(1),
      price: item.price,
    });
  };

  const getMenuItemImage = (item: MenuItem, index: number): string => {
    // First priority: uploaded image from backend
    if (item.image) {
      return item.image.getDirectURL();
    }

    // Second priority: specific mapped image
    if (menuItemImageMap[item.uuid]) {
      return menuItemImageMap[item.uuid];
    }
    
    // Fallback: use rotation of fallback images
    const imageIndex = index % fallbackImages.length;
    return fallbackImages[imageIndex];
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <img 
          src="/assets/generated/hero-banner.dim_800x400.jpg" 
          alt="Food delivery" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {restaurantLoading ? 'SNR Food Court' : restaurant?.name || 'SNR Food Court'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md max-w-2xl">
            {restaurantLoading ? 'Delicious food, made fresh' : restaurant?.description || 'Delicious food, made fresh'}
          </p>
          <div className="w-full max-w-2xl bg-white rounded-full shadow-2xl p-2 flex gap-2">
            <Input
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-foreground"
            />
            <Button size="lg" className="rounded-full px-8">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Restaurant Info */}
      {restaurant && (
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>📍 {restaurant.address}</span>
              {restaurant.phone && <span>📞 {restaurant.phone}</span>}
              {restaurant.website && <span>🌐 {restaurant.website}</span>}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="border-b bg-background sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filter by category:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="container mx-auto px-4 py-12">
        {menuLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <Card key={j} className="animate-pulse">
                      <div className="h-48 bg-muted" />
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedMenuItems).length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No menu items found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-3xl font-bold mb-6 capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, index) => {
                    const imageSrc = getMenuItemImage(item, index);
                    
                    return (
                      <Card key={item.uuid} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="destructive">Unavailable</Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between">
                            <span>{item.name}</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{Number(item.price)}
                            </span>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.isAvailable || addToCart.isPending}
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
