export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export enum BoothRequestType {
  ASSISTANCE = 'assistance',
  CLEANING = 'cleaning',
  EQUIPMENT = 'equipment',
  /** System-only: created alongside an order, never by a client. */
  ORDER = 'order',
  /** Raised from the QR page; staff complete the paid extension at the counter. */
  EXTENSION = 'extension',
}

export enum BoothRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}
