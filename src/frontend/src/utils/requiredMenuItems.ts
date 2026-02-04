import type { MenuItem } from '../backend';

const SINGLE_RESTAURANT_UUID = 'snr-food-court';

// Required menu items that must always appear
export const REQUIRED_MENU_ITEMS: MenuItem[] = [
  {
    uuid: 'chilly-chicken',
    restaurantUuid: SINGLE_RESTAURANT_UUID,
    name: 'Chilly Chicken',
    description: 'Succulent chicken in a spicy chilli sauce.',
    price: BigInt(159),
    category: 'Main Course',
    image: undefined,
    isAvailable: true,
  },
];

/**
 * Merges required menu items into the fetched menu list.
 * If a required item is missing from the backend, it will be added.
 */
export function ensureRequiredMenuItems(fetchedItems: MenuItem[]): MenuItem[] {
  const existingUuids = new Set(fetchedItems.map(item => item.uuid));
  const missingItems = REQUIRED_MENU_ITEMS.filter(item => !existingUuids.has(item.uuid));
  
  return [...fetchedItems, ...missingItems];
}
