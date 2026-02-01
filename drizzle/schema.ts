import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for restaurant system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["customer", "admin", "kitchen", "rider"]).default("customer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Menu categories
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 512 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Menu items
export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image", { length: 512 }),
  available: boolean("available").default(true),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

// Customization options (e.g., "Sweetness Level", "Toppings")
export const customizationOptions = mysqlTable("customizationOptions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["sweetness", "topping", "other"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomizationOption = typeof customizationOptions.$inferSelect;
export type InsertCustomizationOption = typeof customizationOptions.$inferInsert;

// Customization values (e.g., "Less Sweet", "Normal", "Extra Sweet")
export const customizationValues = mysqlTable("customizationValues", {
  id: int("id").autoincrement().primaryKey(),
  customizationOptionId: int("customizationOptionId").notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomizationValue = typeof customizationValues.$inferSelect;
export type InsertCustomizationValue = typeof customizationValues.$inferInsert;

// Link menu items to customization options
export const menuItemCustomizations = mysqlTable("menuItemCustomizations", {
  id: int("id").autoincrement().primaryKey(),
  menuItemId: int("menuItemId").notNull(),
  customizationOptionId: int("customizationOptionId").notNull(),
  required: boolean("required").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenuItemCustomization = typeof menuItemCustomizations.$inferSelect;
export type InsertMenuItemCustomization = typeof menuItemCustomizations.$inferInsert;

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"]).default("pending").notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "assigned", "picked_up", "on_way", "delivered", "cancelled"]).default("pending"),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "transfer"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  riderId: int("riderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  customizations: json("customizations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Favorites
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;