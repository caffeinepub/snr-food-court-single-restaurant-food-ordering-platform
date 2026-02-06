import List "mo:core/List";
import Time "mo:core/Time";

module {
  type OldLiveOrder = {
    orderId : Text;
    customerName : Text;
    customerPhone : Text;
    deliveryAddress : Text;
    items : [OrderMenuItem];
    totalPrice : Nat;
    orderTimestamp : Int;
    status : OrderStatus;
  };

  type OrderMenuItem = {
    uuid : Text;
    quantity : Nat;
    price : Nat;
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type OldActor = {
    liveOrders : List.List<OldLiveOrder>;
  };

  type NewLiveOrder = {
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

  type NewActor = {
    liveOrders : List.List<NewLiveOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newLiveOrders = old.liveOrders.map<OldLiveOrder, NewLiveOrder>(
      func(oldOrder) {
        {
          oldOrder with
          currentLatitude = null;
          currentLongitude = null;
          lastLocationUpdate = ?Time.now();
        };
      }
    );
    { old with liveOrders = newLiveOrders };
  };
};
