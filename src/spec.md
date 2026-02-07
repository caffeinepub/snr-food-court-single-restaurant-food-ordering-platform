# Specification

## Summary
**Goal:** Ensure rejected orders are removed from the admin experience: admin-rejected orders are permanently deleted from backend state, and restaurant-rejected orders no longer appear in admin order lists.

**Planned changes:**
- Backend: Update `rejectOrder(orderId)` to permanently delete the order from stored order collections and clear any related tracking state, while keeping admin-only authorization.
- Backend: Update admin live-orders query behavior so `getAllActiveOrders` excludes orders with status `#rejected`.
- Frontend: Update Admin Dashboard “All Orders” rendering to filter out orders with status `Rejected`, and ensure admin-rejected orders disappear immediately after successful rejection via existing refetch/invalidation.

**User-visible outcome:** Admin users will no longer see rejected orders in Live Orders or All Orders; orders rejected by admins disappear immediately and are removed from backend queries, while non-admin (customer/restaurant) views remain unchanged.
