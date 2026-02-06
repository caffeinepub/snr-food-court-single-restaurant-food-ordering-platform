import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  module CuisineType {
    public func compare(cuisine1 : CuisineType, cuisine2 : CuisineType) : Order.Order {
      switch (cuisine1, cuisine2) {
        case (#other(text1), #other(text2)) { Text.compare(text1, text2) };
        case (#other(_), _) { #greater };
        case (_, #other(_)) { #less };
        case (c1, c2) { Text.compare(debug_show (c1), debug_show (c2)) };
      };
    };
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

  module Restaurant {
    public func compare(restaurant1 : Restaurant, restaurant2 : Restaurant) : Order.Order {
      Text.compare(restaurant1.uuid, restaurant2.uuid);
    };

    public func compareByCuisine(restaurant1 : Restaurant, restaurant2 : Restaurant) : Order.Order {
      switch (CuisineType.compare(restaurant1.cuisineType, restaurant2.cuisineType)) {
        case (#equal) { Text.compare(restaurant1.uuid, restaurant2.uuid) };
        case order { order };
      };
    };

    public func compareByName(restaurant1 : Restaurant, restaurant2 : Restaurant) : Order.Order {
      Text.compare(restaurant1.name, restaurant2.name);
    };
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

  module MenuItem {
    public func compare(menuItem1 : MenuItem, menuItem2 : MenuItem) : Order.Order {
      Text.compare(menuItem1.uuid, menuItem2.uuid);
    };

    public func compareByRestaurant(menuItem1 : MenuItem, menuItem2 : MenuItem) : Order.Order {
      switch (Text.compare(menuItem1.restaurantUuid, menuItem2.restaurantUuid)) {
        case (#equal) { Text.compare(menuItem1.uuid, menuItem2.uuid) };
        case order { order };
      };
    };

    public func compareByPrice(menuItem1 : MenuItem, menuItem2 : MenuItem) : Order.Order {
      switch (Nat.compare(menuItem1.price, menuItem2.price)) {
        case (#equal) { Text.compare(menuItem1.uuid, menuItem2.uuid) };
        case order { order };
      };
    };
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  module OrderStatus {
    public func compare(orderStatus1 : OrderStatus, orderStatus2 : OrderStatus) : Order.Order {
      Text.compare(debug_show (orderStatus1), debug_show (orderStatus2));
    };
  };

  type Order = {
    uuid : Text;
    userId : Principal;
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

  module OrderModule {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Text.compare(order1.uuid, order2.uuid);
    };

    public func compareByTimestamp(order1 : Order, order2 : Order) : Order.Order {
      switch (Int.compare(order1.orderTimestamp, order2.orderTimestamp)) {
        case (#equal) { Text.compare(order1.uuid, order2.uuid) };
        case order { order };
      };
    };

    public func compareByStatus(order1 : Order, order2 : Order) : Order.Order {
      switch (OrderStatus.compare(order1.status, order2.status)) {
        case (#equal) { Text.compare(order1.uuid, order2.uuid) };
        case order { order };
      };
    };
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

  type Cart = [CartItem];

  type FoodCourtProfile = {
    name : Text;
    email : Text;
    address : Text;
    phone : Text;
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

  type UpdateOrderLocationInput = {
    orderId : Text;
    latitude : Float;
    longitude : Float;
  };

  let SINGLE_RESTAURANT_UUID = "snr-food-court";
  let SINGLE_RESTAURANT_INFO : Restaurant = {
    uuid = SINGLE_RESTAURANT_UUID;
    name = "SNR Food Court";
    description = "Single restaurant food court";
    cuisineType = #other("Variety");
    address = "123 Main St, City";
    website = "snrfoodcourt.com";
    phone = "8008448244";
    profilePicture = null;
  };

  let menuItemsList = [
    (
      "veg-manchuria",
      {
        uuid = "veg-manchuria";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Veg Manchuria";
        description = "Crispy and spicy Indo-Chinese delight";
        price = 79;
        category = "Snacks";
        image = null;
        isAvailable = true;
      },
    ),
    (
      "veg-manuhair",
      {
        uuid = "veg-manuhair";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Veg Manuhair";
        description = "Crispy and delicious Indo-Chinese dish";
        price = 79;
        category = "Snacks";
        image = null;
        isAvailable = true;
      },
    ),
    (
      "chicken-manchuria",
      {
        uuid = "chicken-manchuria";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Chicken Manchuria";
        description = "Crispy chicken tossed in spicy Indo-Chinese sauce";
        price = 149;
        category = "Snacks";
        image = null;
        isAvailable = true;
      },
    ),
    (
      "chicken-65",
      {
        uuid = "chicken-65";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Chicken 65";
        description = "Spicy and flavorful deep-fried chicken dish.";
        price = 159;
        category = "Snacks";
        image = null;
        isAvailable = true;
      },
    ),
    (
      "chilly-chicken",
      {
        uuid = "chilly-chicken";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Chilly Chicken";
        description = "Succulent chicken in a spicy chilli sauce.";
        price = 159;
        category = "Main Course";
        image = null;
        isAvailable = true;
      },
    ),
    (
      "chicken-555",
      {
        uuid = "chicken-555";
        restaurantUuid = SINGLE_RESTAURANT_UUID;
        name = "Chicken 555";
        description = "Delicious spicy chicken dish";
        price = 139;
        category = "Main Course";
        image = null;
        isAvailable = true;
      },
    ),
  ];

  let menuItems = Map.empty<Text, MenuItem>();
  let orders = Map.empty<Text, Order>();
  let carts = Map.empty<Principal, Cart>();
  let searchHistory = Map.empty<Principal, List.List<Text>>();
  let orderStatusTracking = Map.empty<Text, OrderStatus>();
  let profiles = Map.empty<Principal, FoodCourtProfile>();
  let liveOrders = List.empty<LiveOrder>();
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextOrderId = 1;

  public query ({ caller }) func getSingleRestaurant() : async Restaurant {
    SINGLE_RESTAURANT_INFO;
  };

  public query ({ caller }) func getMenuItem(uuid : Text) : async MenuItem {
    switch (menuItems.get(uuid)) {
      case (null) { Runtime.trap("MenuItem " # uuid # " not found") };
      case (?menuItem) { menuItem };
    };
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menuItems.values().toArray().sort();
  };

  public shared ({ caller }) func addMenuItem(menuItem : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (menuItem.restaurantUuid != SINGLE_RESTAURANT_UUID) {
      Runtime.trap("Invalid restaurant UUID. This platform only supports " # SINGLE_RESTAURANT_INFO.name);
    };

    menuItems.add(menuItem.uuid, menuItem);
  };

  public shared ({ caller }) func deleteMenuItem(uuid : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not menuItems.containsKey(uuid)) {
      Runtime.trap("MenuItem " # uuid # " not found");
    };

    menuItems.remove(uuid);
  };

  func getCart(user : Principal) : Cart {
    switch (carts.get(user)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  func saveCart(user : Principal, cart : Cart) {
    carts.add(user, cart);
  };

  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (item.restaurantUuid != SINGLE_RESTAURANT_UUID) {
      Runtime.trap("Invalid restaurant UUID. Cannot add items from other restaurants.");
    };

    let currentCart = getCart(caller);
    let newCart = currentCart.concat([item]);
    saveCart(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(menuItemUuid : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    let currentCart = getCart(caller);
    let newCart = currentCart.filter(func(item) { item.menuItemUuid != menuItemUuid });
    saveCart(caller, newCart);
  };

  public query ({ caller }) func getCartItems() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    getCart(caller);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  func calculateTotalPrice(cart : Cart) : Nat {
    var total = 0;
    for (item in cart.values()) {
      total += item.price * item.quantity;
    };
    total;
  };

  let FIXED_DELIVERY_FEE = 25;

  public shared ({ caller }) func placeOrder(
    address : Text,
    userNotes : Text,
    customerName : Text,
    customerPhone : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = getCart(caller);

    if (cart.size() == 0) {
      Runtime.trap("Cannot place order with empty cart");
    };

    let items = cart.map(func(item) { { uuid = item.menuItemUuid; quantity = item.quantity; price = item.price } });

    let totalPrice = calculateTotalPrice(cart) + FIXED_DELIVERY_FEE;
    let orderId = "order-" # nextOrderId.toText();
    let currentTime = Time.now();
    let order : Order = {
      uuid = orderId;
      userId = caller;
      restaurantId = SINGLE_RESTAURANT_UUID;
      items;
      totalPrice;
      status = #pending;
      orderTimestamp = currentTime;
      deliveryAddress = address;
      userNotes;
      customerName;
      customerPhone;
    };

    orders.add(orderId, order);
    carts.remove(caller);

    // Add live order with correct timestamp
    let newLiveOrder : LiveOrder = {
      orderId;
      customerName;
      customerPhone;
      deliveryAddress = address;
      items;
      totalPrice;
      orderTimestamp = currentTime; // Set live order timestamp
      status = #pending;
      currentLatitude = null;
      currentLongitude = null;
      lastLocationUpdate = null;
    };
    liveOrders.add(newLiveOrder);

    nextOrderId += 1;

    orderId;
  };

  public query ({ caller }) func getOrder(uuid : Text) : async Order {
    switch (orders.get(uuid)) {
      case (null) { Runtime.trap("Order " # uuid # " not found") };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.userId == caller });
  };

  public shared ({ caller }) func updateOrderStatus(uuid : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (orders.get(uuid)) {
      case (null) { Runtime.trap("Order " # uuid # " not found") };
      case (?order) {
        let updatedOrder : Order = {
          uuid = order.uuid;
          userId = order.userId;
          restaurantId = order.restaurantId;
          items = order.items;
          totalPrice = order.totalPrice;
          status = status;
          orderTimestamp = order.orderTimestamp;
          deliveryAddress = order.deliveryAddress;
          userNotes = order.userNotes;
          customerName = order.customerName;
          customerPhone = order.customerPhone;
        };
        orders.add(uuid, updatedOrder);
        orderStatusTracking.add(uuid, status);

        // Update live order status
        let updatedLiveOrders = List.empty<LiveOrder>();
        for (liveOrder in liveOrders.values()) {
          if (liveOrder.orderId == uuid) {
            let updatedLiveOrder : LiveOrder = {
              liveOrder with
              status
            };
            updatedLiveOrders.add(updatedLiveOrder);
          } else {
            updatedLiveOrders.add(liveOrder);
          };
        };
        liveOrders.clear();
        liveOrders.addAll(updatedLiveOrders.values());
      };
    };
  };

  public query ({ caller }) func getAllActiveOrders() : async [LiveOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    // Return only non-delivered and non-cancelled orders
    let activeOrders = List.empty<LiveOrder>();
    for (liveOrder in liveOrders.values()) {
      if (liveOrder.status != #delivered and liveOrder.status != #cancelled) {
        activeOrders.add(liveOrder);
      };
    };
    activeOrders.toArray();
  };

  public shared ({ caller }) func addSearchHistory(search : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save search history");
    };
    let searches = switch (searchHistory.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?history) { history };
    };

    searches.add(search);
    searchHistory.add(caller, searches);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?FoodCourtProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access this endpoint");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?FoodCourtProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : FoodCourtProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access this endpoint");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getMenuByCategory(category : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.category == category });
  };

  public query ({ caller }) func searchMenuByName(searchTerm : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.name.contains(#text searchTerm) });
  };

  public query ({ caller }) func filterMenuByPriceRange(minPrice : Nat, maxPrice : Nat) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.price >= minPrice and item.price <= maxPrice });
  };

  // Menu item update
  public shared ({ caller }) func updateMenuItem(
    uuid : Text,
    newName : ?Text,
    newDescription : ?Text,
    newPrice : ?Nat,
    newCategory : ?Text,
    newIsAvailable : ?Bool,
    newImage : ?Storage.ExternalBlob,
  ) : async () {
    // Check admin access
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    // Get current menu item state
    let currentMenuItem = switch (menuItems.get(uuid)) {
      case (null) { Runtime.trap(uuid # " not found") };
      case (?item) { item };
    };

    // If image is set, store reference
    // Update menu item record
    let updatedMenuItem : MenuItem = {
      uuid = currentMenuItem.uuid;
      restaurantUuid = currentMenuItem.restaurantUuid;
      name = switch (newName) {
        case (null) { currentMenuItem.name };
        case (?name) { name };
      };
      description = switch (newDescription) {
        case (null) { currentMenuItem.description };
        case (?desc) { desc };
      };
      price = switch (newPrice) {
        case (null) { currentMenuItem.price };
        case (?price) { price };
      };
      category = switch (newCategory) {
        case (null) { currentMenuItem.category };
        case (?cat) { cat };
      };
      isAvailable = switch (newIsAvailable) {
        case (null) { currentMenuItem.isAvailable };
        case (?available) { available };
      };
      image = switch (newImage) {
        case (null) { currentMenuItem.image };
        case (?image) { ?image };
      };
    };
    menuItems.add(uuid, updatedMenuItem);
  };

  // Cart update endpoint (for internal use in bot)
  type UpdateCartItemInput = {
    menuItemUuid : Text;
    quantity : ?Nat; // null means no changes
  };

  public shared ({ caller }) func updateCartItems(items : [UpdateCartItemInput], keepItemsWithQuantityZero : Bool) : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    let existingCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    // Create mutable result with original items
    let mutableCart = List.fromArray<CartItem>(existingCart);
    // Process edits
    for (item in items.values()) {
      if (item.quantity == ?0 and not keepItemsWithQuantityZero) {
        let filteredCart = mutableCart.filter(
          func(cartItem) {
            cartItem.menuItemUuid != item.menuItemUuid;
          }
        );
        mutableCart.clear();
        mutableCart.addAll(filteredCart.values());
      } else {
        mutableCart.add({
          restaurantUuid = SINGLE_RESTAURANT_UUID;
          menuItemUuid = item.menuItemUuid;
          quantity = switch (item.quantity) {
            case (null) { 1 };
            case (?quantity) { quantity };
          };
          price = 0; // Price unknown, to be implemented
        });
      };
    };

    // Convert back to array for persistence
    let updatedCart = mutableCart.toArray();
    saveCart(caller, updatedCart);
    updatedCart;
  };

  public shared ({ caller }) func markOrderAsDelivered(uuid : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark orders as delivered");
    };

    // Fetch and update order status
    switch (orders.get(uuid)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          uuid = order.uuid;
          userId = order.userId;
          restaurantId = order.restaurantId;
          items = order.items;
          totalPrice = order.totalPrice;
          status = #delivered;
          orderTimestamp = order.orderTimestamp;
          deliveryAddress = order.deliveryAddress;
          userNotes = order.userNotes;
          customerName = order.customerName;
          customerPhone = order.customerPhone;
        };
        orders.add(uuid, updatedOrder);
      };
    };

    // Update real-time tracking
    for (liveOrder in liveOrders.values()) {
      if (liveOrder.orderId == uuid) {
        let updatedLiveOrder : LiveOrder = liveOrder;
      };
    };
  };

  // Admin only endpoint
  public shared ({ caller }) func clearActiveOrders() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can clear orders");
    };
    liveOrders.clear();
  };

  public query ({ caller }) func getStandardizedRestaurantContactInfo() : async Text {
    SINGLE_RESTAURANT_INFO.phone;
  };

  // New endpoint to update order location for live tracking
  public shared ({ caller }) func updateCustomerLocationOnOrder(input : UpdateOrderLocationInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update live order location");
    };

    let order = switch (orders.get(input.orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    if (order.userId != caller) {
      Runtime.trap("You can only update location for your own orders");
    };

    if (order.status == #delivered or order.status == #cancelled) {
      Runtime.trap("Cannot update location for completed orders");
    };

    let updatedActiveOrders = liveOrders.map<LiveOrder, LiveOrder>(
      func(liveOrder) {
        if (liveOrder.orderId == input.orderId) {
          {
            liveOrder with
            currentLatitude = ?input.latitude;
            currentLongitude = ?input.longitude;
            lastLocationUpdate = ?Time.now();
          };
        } else {
          liveOrder;
        };
      }
    );

    liveOrders.clear();
    liveOrders.addAll(updatedActiveOrders.values());
  };

  // New query to get live order location for specific order
  public query ({ caller }) func getLiveOrderLocation(orderId : Text) : async ?{
    latitude : Float;
    longitude : Float;
    lastLocationUpdate : Int;
  } {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view location for your own orders");
    };

    let liveOrder = liveOrders.values().find(func(o) { o.orderId == orderId });
    switch (liveOrder) {
      case (null) { null };
      case (?liveOrder) {
        if (liveOrder.currentLatitude.isSome() and liveOrder.currentLongitude.isSome()) {
          switch (liveOrder.currentLatitude, liveOrder.currentLongitude, liveOrder.lastLocationUpdate) {
            case (?latitude, ?longitude, ?lastLocationUpdate) {
              ?{
                latitude;
                longitude;
                lastLocationUpdate;
              };
            };
            case (_) { null };
          };
        } else {
          null;
        };
      };
    };
  };
};
