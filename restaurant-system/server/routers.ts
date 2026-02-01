import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Menu procedures
  menu: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllMenuItems();
    }),

    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuItemsByCategory(input.categoryId);
      }),

    getCategories: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchMenuItems(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuItemById(input.id);
      }),
  }),

  // Customization procedures
  customizations: router({
    getByMenuItemId: publicProcedure
      .input(z.object({ menuItemId: z.number() }))
      .query(async ({ input }) => {
        return db.getCustomizationsByMenuItemId(input.menuItemId);
      }),
  }),

  // Order procedures
  orders: router({
    create: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number(),
          price: z.string(),
          customizations: z.any().optional(),
        })),
        totalPrice: z.string(),
        paymentMethod: z.enum(['cash', 'transfer']),
        deliveryAddress: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log("[API] orders.create called with input:", JSON.stringify(input));
        const userId = ctx.user?.id || 1;
        console.log("[API] Using userId:", userId);
        const order = await db.createOrder({
          userId: userId,
          totalPrice: input.totalPrice,
          paymentMethod: input.paymentMethod,
          deliveryAddress: input.deliveryAddress,
          latitude: input.latitude,
          longitude: input.longitude,
          notes: input.notes,
        });

        // Add order items
        for (const item of input.items) {
          await db.addOrderItem({
            orderId: (order as any).insertId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations,
          });
        }

        return { success: true, orderId: (order as any).insertId };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new Error("Order not found");
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),

    updateDeliveryStatus: protectedProcedure
      .input(z.object({ id: z.number(), deliveryStatus: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateDeliveryStatus(input.id, input.deliveryStatus);
        return { success: true };
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getAllOrders();
    }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'kitchen' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getPendingOrders();
    }),

    getPreparing: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'kitchen' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getPreparingOrders();
    }),

    getReady: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'kitchen' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getReadyOrders();
    }),

    getDelivering: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'rider' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getDeliveringOrders();
    }),

    getCompleted: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getCompletedOrders();
    }),

    // Delivery status queries for Rider Dashboard
    getPendingDelivery: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'rider' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getPendingDeliveryOrders();
    }),    getDeliveringDeliveryOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'rider' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      const riderId = ctx.user.role === 'rider' ? ctx.user.id : undefined;
      return db.getDeliveringDeliveryOrders(riderId);
    }),  getCompletedDelivery: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'rider' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getCompletedDeliveryOrders();
    }),
  }),

  // Favorites procedures
  favorites: router({
    add: protectedProcedure
      .input(z.object({ menuItemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.addFavorite(ctx.user.id, input.menuItemId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ menuItemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.removeFavorite(ctx.user.id, input.menuItemId);
        return { success: true };
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getFavoritesByUserId(ctx.user.id);
    }),

    isFavorite: protectedProcedure
      .input(z.object({ menuItemId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.isFavorite(ctx.user.id, input.menuItemId);
      }),
  }),

  // Kitchen procedures
  kitchen: router({
    getOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'kitchen' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getKitchenOrders();
    }),
  }),

  // Rider procedures
  rider: router({
    getOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'rider' && ctx.user.role !== 'admin') {
        throw new Error("Unauthorized");
      }
      return db.getRiderOrders(ctx.user.id);
    }),

    assignOrder: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const riderId = ctx.user?.id || 2;
        await db.assignRiderToOrder(input.orderId, riderId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
