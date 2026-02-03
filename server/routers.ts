import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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

  // Menu Router
  menu: router({
    categories: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    itemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMenuItemsByCategory(input.categoryId);
      }),

    itemDetails: publicProcedure
      .input(z.object({ itemId: z.number() }))
      .query(async ({ input }) => {
        const item = await db.getMenuItemById(input.itemId);
        if (!item) return null;

        const options = await db.getCustomizationOptions(input.itemId);
        const optionsWithValues = await Promise.all(
          options.map(async (option) => ({
            ...option,
            values: await db.getCustomizationValues(option.id),
          }))
        );

        return {
          item,
          customizationOptions: optionsWithValues,
        };
      }),
  }),

  // Orders Router
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              menuItemId: z.number(),
              quantity: z.number(),
              customizations: z.string().optional(),
            })
          ),
          totalPrice: z.string(),
          deliveryAddress: z.string(),
          paymentMethod: z.enum(["cash", "transfer"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Create order
          const order = await db.createOrder({
            userId: ctx.user!.id,
            status: "pending",
            totalPrice: input.totalPrice as any,
            deliveryAddress: input.deliveryAddress,
            paymentMethod: input.paymentMethod,
            paymentStatus: "pending",
          });

          // Create order items
          for (const item of input.items) {
            const menuItem = await db.getMenuItemById(item.menuItemId);
            if (!menuItem) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Menu item ${item.menuItemId} not found`,
              });
            }

            await db.createOrderItem({
              orderId: order.insertId as number,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem.price,
              customizations: item.customizations,
            });
          }

          return {
            orderId: order.insertId,
            status: "pending",
          };
        } catch (error) {
          console.error("Error creating order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user!.id);
    }),

    details: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Check if user owns this order
        if (order.userId !== ctx.user!.id && ctx.user!.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this order",
          });
        }

        const items = await db.getOrderItems(input.orderId);
        return {
          order,
          items,
        };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin or kitchen
        if (ctx.user!.role !== "admin" && ctx.user!.role !== "kitchen") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update order status",
          });
        }

        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
  }),

  // Admin Router
  admin: router({
    allOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user!.role !== "admin" && ctx.user!.role !== "kitchen") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view all orders",
        });
      }

      return await db.getAllOrders();
    }),

    orderDetails: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user!.role !== "admin" && ctx.user!.role !== "kitchen") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view order details",
          });
        }

        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        const items = await db.getOrderItems(input.orderId);
        return {
          order,
          items,
        };
      }),

    updateOrderStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user!.role !== "admin" && ctx.user!.role !== "kitchen") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update order status",
          });
        }

        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
