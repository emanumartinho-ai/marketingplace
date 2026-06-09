import { Router } from "express";
import { db, ordersTable, productsTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";

const router = Router();

async function buildOrderResponse(order: typeof ordersTable.$inferSelect) {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));
  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, order.buyerId));
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, order.sellerId));

  return {
    id: order.id,
    productId: order.productId,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    price: Number(order.price),
    currency: order.currency,
    status: order.status,
    productName: product?.name ?? null,
    productImageUrl: product?.imageUrl ?? null,
    buyerName: buyer ? `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim() || buyer.email : null,
    sellerName: seller ? `${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim() || seller.email : null,
    createdAt: order.createdAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
  };
}

// GET /orders
router.get("/orders", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const { role } = req.query;
  let orders: (typeof ordersTable.$inferSelect)[];

  if (role === "buyer") {
    orders = await db.select().from(ordersTable).where(eq(ordersTable.buyerId, req.user.id));
  } else if (role === "seller") {
    orders = await db.select().from(ordersTable).where(eq(ordersTable.sellerId, req.user.id));
  } else {
    orders = await db.select().from(ordersTable).where(
      or(eq(ordersTable.buyerId, req.user.id), eq(ordersTable.sellerId, req.user.id))!
    );
  }

  const results = await Promise.all(orders.map(buildOrderResponse));
  return res.json(results);
});

// POST /orders — create order
router.post("/orders", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, Number(productId)));
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (!product.sellerId) return res.status(400).json({ error: "This product has no seller" });
  if (product.sellerId === req.user.id) return res.status(400).json({ error: "Cannot buy your own product" });

  const [order] = await db.insert(ordersTable).values({
    productId: product.id,
    buyerId: req.user.id,
    sellerId: product.sellerId,
    price: product.price,
    currency: product.currency,
    status: "paid",
  }).returning();

  return res.status(201).json(await buildOrderResponse(order));
});

// GET /orders/:id
router.get("/orders/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.json(await buildOrderResponse(order));
});

// PATCH /orders/:id/ship — seller marks as shipped
router.patch("/orders/:id/ship", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.sellerId !== req.user.id) return res.status(403).json({ error: "Only seller can mark as shipped" });
  if (order.status !== "paid") return res.status(400).json({ error: "Order is not in paid state" });

  const [updated] = await db.update(ordersTable)
    .set({ status: "shipped", shippedAt: new Date() })
    .where(eq(ordersTable.id, order.id))
    .returning();

  return res.json(await buildOrderResponse(updated));
});

// PATCH /orders/:id/confirm — buyer confirms delivery (releases escrow)
router.patch("/orders/:id/confirm", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.buyerId !== req.user.id) return res.status(403).json({ error: "Only buyer can confirm delivery" });
  if (order.status !== "shipped") return res.status(400).json({ error: "Order has not been shipped yet" });

  const [updated] = await db.update(ordersTable)
    .set({ status: "delivered", deliveredAt: new Date() })
    .where(eq(ordersTable.id, order.id))
    .returning();

  return res.json(await buildOrderResponse(updated));
});

// PATCH /orders/:id/dispute — buyer opens dispute
router.patch("/orders/:id/dispute", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.buyerId !== req.user.id) return res.status(403).json({ error: "Only buyer can open a dispute" });
  if (!["paid", "shipped"].includes(order.status)) return res.status(400).json({ error: "Cannot dispute at this stage" });

  const [updated] = await db.update(ordersTable)
    .set({ status: "disputed" })
    .where(eq(ordersTable.id, order.id))
    .returning();

  return res.json(await buildOrderResponse(updated));
});

export default router;
