# Specification

## Summary
**Goal:** Update the existing Chicken Manchuria menu item to price ₹159 and ensure it displays a dedicated food photo on the Home page.

**Planned changes:**
- Update backend menu item uuid `chicken-manchuria` to appear as “Chicken Manchuria” with `price = 159`, keeping it available and associated with restaurant `snr-food-court`.
- Add the Chicken Manchuria image asset at `frontend/public/assets/generated/chicken-manchuria.dim_300x300.jpg` and ensure the Home page menu card uses it via the existing `menuItemImageMap`.

**User-visible outcome:** Users see “Chicken Manchuria” listed at ₹159 on the menu with its own photo shown on the Home page menu card.
