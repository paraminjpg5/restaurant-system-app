import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(role: string = "customer"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Menu Router", () => {
  it("should fetch categories", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const categories = await caller.menu.categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should fetch menu items by category", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const items = await caller.menu.itemsByCategory({ categoryId: 1 });
    expect(Array.isArray(items)).toBe(true);
  });
});

describe("Orders Router", () => {
  it("should require authentication to create order", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    });

    try {
      await caller.orders.create({
        items: [],
        totalPrice: "0",
        deliveryAddress: "123 Main St",
        paymentMethod: "cash",
      });
      expect.fail("Should throw unauthorized error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should fetch user orders", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("Admin Router", () => {
  it("should require admin role to fetch all orders", async () => {
    const caller = appRouter.createCaller(createMockContext("customer"));

    try {
      await caller.admin.allOrders();
      expect.fail("Should throw forbidden error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to fetch all orders", async () => {
    const caller = appRouter.createCaller(createMockContext("admin"));
    const orders = await caller.admin.allOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should allow kitchen to fetch all orders", async () => {
    const caller = appRouter.createCaller(createMockContext("kitchen"));
    const orders = await caller.admin.allOrders();
    expect(Array.isArray(orders)).toBe(true);
  });
});
