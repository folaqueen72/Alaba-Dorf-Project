import { describe, expect, it } from "vitest";
import { koboToNaira, orderNumber } from "../format";
import { canMoveOrder, canMoveBooking } from "../workflow";

describe("money formatting", () => {
  it("formats kobo to naira", () => {
    expect(koboToNaira(750000)).toBe("₦7,500");
    expect(koboToNaira(300000)).toBe("₦3,000");
    expect(koboToNaira(0)).toBe("₦0");
  });

  it("builds order numbers", () => {
    expect(orderNumber(1042)).toBe("#ADO1042");
  });

  it("order math stays in integers", () => {
    const crates = 5;
    const perCrate = 750000;
    expect(crates * perCrate).toBe(3750000);
    expect(koboToNaira(crates * perCrate)).toBe("₦37,500");
  });
});

describe("order workflow", () => {
  it("follows the happy path", () => {
    expect(canMoveOrder("PENDING_PAYMENT", "CONFIRMED")).toBe(true);
    expect(canMoveOrder("CONFIRMED", "PREPARING")).toBe(true);
    expect(canMoveOrder("PREPARING", "READY")).toBe(true);
    expect(canMoveOrder("READY", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canMoveOrder("OUT_FOR_DELIVERY", "COMPLETED")).toBe(true);
  });

  it("allows cancelling from any live state", () => {
    for (const s of [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
    ] as const) {
      expect(canMoveOrder(s, "CANCELLED")).toBe(true);
    }
  });

  it("never leaves terminal states", () => {
    for (const s of ["COMPLETED", "CANCELLED"] as const) {
      expect(canMoveOrder(s, "CONFIRMED")).toBe(false);
      expect(canMoveOrder(s, "PREPARING")).toBe(false);
    }
  });

  it("rejects skips", () => {
    expect(canMoveOrder("PENDING_PAYMENT", "READY")).toBe(false);
    expect(canMoveOrder("CONFIRMED", "COMPLETED")).toBe(false);
  });
});

describe("booking workflow", () => {
  it("follows the happy path", () => {
    expect(canMoveBooking("PENDING_PAYMENT", "CONFIRMED")).toBe(true);
    expect(canMoveBooking("CONFIRMED", "UPCOMING")).toBe(true);
    expect(canMoveBooking("UPCOMING", "COMPLETED")).toBe(true);
  });

  it("never revives finished bookings", () => {
    expect(canMoveBooking("COMPLETED", "CONFIRMED")).toBe(false);
    expect(canMoveBooking("CANCELLED", "UPCOMING")).toBe(false);
  });
});
