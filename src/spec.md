# Specification

## Summary
**Goal:** Automatically share a customer’s live location with the restaurant/admin after checkout, updating every 1 second and showing it in the Admin Dashboard’s Live Orders view.

**Planned changes:**
- Extend the backend live order model to store the latest customer latitude/longitude and a last-updated timestamp, and include these fields in the existing admin live orders feed (null/missing when not available).
- Add a backend endpoint for the customer who placed an order to push live location updates for that order; reject updates from non-owners and for delivered/cancelled orders.
- In the customer frontend, request browser geolocation permission immediately after successful checkout and send location updates to the backend about once per second while the order is active; show a clear English message if location sharing is unavailable/denied.
- Update the Admin Dashboard Live Orders UI to poll every 1 second and display each order’s current lat/lng plus a “last updated” indicator, with an English fallback when location is not yet available.
- Add/extend typed React Query hooks to (a) push live location updates and (b) consume the updated live orders data in the admin feed, without changing any immutable frontend paths.

**User-visible outcome:** After checkout, the customer’s browser begins sharing live location (with permission) about once per second while the order is active, and admins can see each active order’s current lat/lng and how recently it was updated in the Live Orders dashboard (or “Location not available yet” when missing).
