import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  // Orders management
  allOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "kitchen") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return db.getAllOrders();
  }),

  orderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "kitchen") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getOrderDetails(input.orderId);
    }),

  updateOrderStatus: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "kitchen") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.updateOrderStatus(input.orderId, input.status);
    }),

  // Menu management
  categories: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return db.getCategories();
  }),

  menuItems: protectedProcedure
    .input(z.object({ categoryId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (input.categoryId) {
        return db.getMenuItemsByCategory(input.categoryId);
      }
      // Return all menu items
      return [];
    }),
});
