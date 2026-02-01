import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  menu: router({
    categories: publicProcedure.query(() => db.getCategories()),
    itemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(({ input }) => db.getMenuItemsByCategory(input.categoryId)),
    itemDetails: publicProcedure
      .input(z.object({ menuItemId: z.number() }))
      .query(({ input }) => db.getMenuItemWithCustomizations(input.menuItemId)),
  }),

  admin: adminRouter,

  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number(),
          price: z.string(),
          customizations: z.any().optional(),
        })),
        totalPrice: z.string(),
        deliveryAddress: z.string(),
        paymentMethod: z.enum(["cash", "transfer"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.createOrder({
          userId: ctx.user.id,
          totalPrice: input.totalPrice,
          deliveryAddress: input.deliveryAddress,
          paymentMethod: input.paymentMethod,
          status: "pending",
          paymentStatus: "pending",
        });
        
        const orderId = (order as any).insertId || 1;
        
        for (const item of input.items) {
          await db.createOrderItem({
            orderId: orderId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations ? JSON.stringify(item.customizations) : null,
          });
        }
        
        return { orderId: orderId };
      }),
    
    list: protectedProcedure.query(({ ctx }) => db.getUserOrders(ctx.user.id)),
    
    details: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrderDetails(input.orderId)),
    
    allOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "kitchen") {
        throw new Error("Unauthorized");
      }
      return db.getAllOrders();
    }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "kitchen") {
          throw new Error("Unauthorized");
        }
        return db.updateOrderStatus(input.orderId, input.status);
      }),
  }),
});

export type AppRouter = typeof appRouter;
