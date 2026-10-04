import type { OrderStatus, BookingStatus } from "@prisma/client";

// Single source of truth for status machines (PRD §11–12).
export const ORDER_NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const BOOKING_NEXT: Record<BookingStatus, BookingStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["UPCOMING", "CANCELLED"],
  UPCOMING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canMoveOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_NEXT[from].includes(to);
}

export function canMoveBooking(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_NEXT[from].includes(to);
}
