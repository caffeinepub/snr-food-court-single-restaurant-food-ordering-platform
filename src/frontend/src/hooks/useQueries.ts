import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Restaurant, MenuItem, Order, Cart, FoodCourtProfile, CartItem, OrderStatus, LiveOrder, UpdateOrderLocationInput } from '../backend';
import { toast } from 'sonner';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<FoodCourtProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: FoodCourtProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

// Single Restaurant
export function useGetSingleRestaurant() {
  const { actor, isFetching } = useActor();

  return useQuery<Restaurant>({
    queryKey: ['singleRestaurant'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSingleRestaurant();
    },
    enabled: !!actor && !isFetching,
  });
}

// Menu Items
export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMenuItem(uuid: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem>({
    queryKey: ['menuItem', uuid],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMenuItem(uuid);
    },
    enabled: !!actor && !isFetching && !!uuid,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItem: MenuItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(menuItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add menu item');
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(uuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete menu item');
    },
  });
}

// Cart
export function useGetCartItems() {
  const { actor, isFetching } = useActor();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CartItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemUuid: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(menuItemUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Removed from cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });
}

// Orders
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<string, Error, { address: string; userNotes: string; customerName: string; customerPhone: string }>({
    mutationFn: async ({ address, userNotes, customerName, customerPhone }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(address, userNotes, customerName, customerPhone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
}

export function useGetUserOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllActiveOrders(isAdmin: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveOrder[]>({
    queryKey: ['liveOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveOrders();
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, status }: { uuid: string; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(uuid, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['liveOrders'] });
      toast.success('Order status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
}

// Live Location Tracking
export function useUpdateCustomerLocationOnOrder() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (input: UpdateOrderLocationInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomerLocationOnOrder(input);
    },
    onError: (error: Error) => {
      // Silently log errors to avoid spamming the user with toasts every second
      console.error('Failed to update location:', error.message);
    },
  });
}

// Admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
