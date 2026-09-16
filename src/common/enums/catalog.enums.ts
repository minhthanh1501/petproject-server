export enum MenuItemType {
  DRINK = 'drink',
  SNACK = 'snack',
  FOOD = 'food',
  PRINTING = 'printing',
  STATIONERY = 'stationery',
  LOCKER = 'locker',
  SERVICE = 'service',
}

/** Billing unit for an add-on: printing is per page, a locker per day. */
export enum MenuItemUnit {
  ITEM = 'item',
  CUP = 'cup',
  PAGE = 'page',
  DAY = 'day',
  HOUR = 'hour',
}
