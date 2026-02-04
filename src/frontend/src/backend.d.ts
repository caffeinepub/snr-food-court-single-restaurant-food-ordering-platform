import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface OrderMenuItem {
    uuid: string;
    quantity: bigint;
    price: bigint;
}
export interface LiveOrder {
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    customerPhone: string;
    orderId: string;
    items: Array<OrderMenuItem>;
    totalPrice: bigint;
    orderTimestamp: bigint;
}
export interface UpdateCartItemInput {
    menuItemUuid: string;
    quantity?: bigint;
}
export type CuisineType = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "chicken";
    chicken: null;
} | {
    __kind__: "chinese";
    chinese: null;
} | {
    __kind__: "healthy";
    healthy: null;
} | {
    __kind__: "mexican";
    mexican: null;
} | {
    __kind__: "fastFood";
    fastFood: null;
} | {
    __kind__: "italian";
    italian: null;
} | {
    __kind__: "indian";
    indian: null;
} | {
    __kind__: "american";
    american: null;
} | {
    __kind__: "pizza";
    pizza: null;
} | {
    __kind__: "burger";
    burger: null;
} | {
    __kind__: "barbecue";
    barbecue: null;
};
export interface Restaurant {
    name: string;
    uuid: string;
    cuisineType: CuisineType;
    description: string;
    website: string;
    address: string;
    phone: string;
    profilePicture?: ExternalBlob;
}
export interface Order {
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    customerPhone: string;
    userId: Principal;
    userNotes: string;
    uuid: string;
    restaurantId: string;
    items: Array<OrderMenuItem>;
    totalPrice: bigint;
    orderTimestamp: bigint;
}
export interface MenuItem {
    name: string;
    uuid: string;
    isAvailable: boolean;
    description: string;
    restaurantUuid: string;
    category: string;
    image?: ExternalBlob;
    price: bigint;
}
export type Cart = Array<CartItem>;
export interface FoodCourtProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface CartItem {
    menuItemUuid: string;
    restaurantUuid: string;
    quantity: bigint;
    price: bigint;
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(menuItem: MenuItem): Promise<void>;
    addSearchHistory(search: string): Promise<void>;
    addToCart(item: CartItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearActiveOrders(): Promise<void>;
    clearCart(): Promise<void>;
    deleteMenuItem(uuid: string): Promise<void>;
    filterMenuByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<MenuItem>>;
    getAllActiveOrders(): Promise<Array<LiveOrder>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<FoodCourtProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCartItems(): Promise<Cart>;
    getMenuByCategory(category: string): Promise<Array<MenuItem>>;
    getMenuItem(uuid: string): Promise<MenuItem>;
    getOrder(uuid: string): Promise<Order>;
    getSingleRestaurant(): Promise<Restaurant>;
    getStandardizedRestaurantContactInfo(): Promise<string>;
    getUserOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<FoodCourtProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markOrderAsDelivered(uuid: string): Promise<void>;
    placeOrder(address: string, userNotes: string, customerName: string, customerPhone: string): Promise<string>;
    removeFromCart(menuItemUuid: string): Promise<void>;
    saveCallerUserProfile(profile: FoodCourtProfile): Promise<void>;
    searchMenuByName(searchTerm: string): Promise<Array<MenuItem>>;
    updateCartItems(items: Array<UpdateCartItemInput>, keepItemsWithQuantityZero: boolean): Promise<Cart>;
    updateMenuItem(uuid: string, newName: string | null, newDescription: string | null, newPrice: bigint | null, newCategory: string | null, newIsAvailable: boolean | null, newImage: ExternalBlob | null): Promise<void>;
    updateOrderStatus(uuid: string, status: OrderStatus): Promise<void>;
}
