import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type CuisineType = {
    #american;
    #barbecue;
    #burger;
    #chicken;
    #chinese;
    #fastFood;
    #healthy;
    #indian;
    #italian;
    #mexican;
    #pizza;
    #other : Text;
  };

  type Restaurant = {
    uuid : Text;
    name : Text;
    description : Text;
    cuisineType : CuisineType;
    address : Text;
    website : Text;
    phone : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type MenuItem = {
    uuid : Text;
    restaurantUuid : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : ?Storage.ExternalBlob;
    isAvailable : Bool;
  };

  type OrderStatus = {
    #pending;
    #accepted;
    #rejected;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type Order = {
    uuid : Text;
    userId : Principal.Principal;
    restaurantId : Text;
    items : [OrderMenuItem];
    totalPrice : Nat;
    status : OrderStatus;
    orderTimestamp : Int;
    deliveryAddress : Text;
    userNotes : Text;
    customerName : Text;
    customerPhone : Text;
  };

  type OrderMenuItem = {
    uuid : Text;
    quantity : Nat;
    price : Nat;
  };

  type CartItem = {
    restaurantUuid : Text;
    menuItemUuid : Text;
    quantity : Nat;
    price : Nat;
  };

  type LiveOrder = {
    orderId : Text;
    customerName : Text;
    customerPhone : Text;
    deliveryAddress : Text;
    items : [OrderMenuItem];
    totalPrice : Nat;
    orderTimestamp : Int;
    status : OrderStatus;
    currentLatitude : ?Float;
    currentLongitude : ?Float;
    lastLocationUpdate : ?Int;
  };

  type FoodCourtProfile = {
    name : Text;
    email : Text;
    address : Text;
    phone : Text;
  };

  type OldActor = {
    menuItems : Map.Map<Text, MenuItem>;
    orders : Map.Map<Text, Order>;
    carts : Map.Map<Principal.Principal, [CartItem]>;
    searchHistory : Map.Map<Principal.Principal, List.List<Text>>;
    orderStatusTracking : Map.Map<Text, OrderStatus>;
    profiles : Map.Map<Principal.Principal, FoodCourtProfile>;
    liveOrders : List.List<LiveOrder>;
    accessControlState : AccessControl.AccessControlState;
    nextOrderId : Nat;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
