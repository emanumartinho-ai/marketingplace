import { pgEnum, pgTable, serial, integer, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { usersTable } from "./auth";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "disputed",
  "cancelled",
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  buyerId: varchar("buyer_id").notNull().references(() => usersTable.id),
  sellerId: varchar("seller_id").notNull().references(() => usersTable.id),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("EUR"),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, shippedAt: true, deliveredAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
