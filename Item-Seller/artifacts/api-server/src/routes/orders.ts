import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    id: order.id, userId: order.userId, status: order.status,
    total: Number(order.total), currency: order.currency,
    shippingAddress: order.shippingAddress, shippingCountry: order.shippingCountry,
    trackingCode: order.trackingCode,
    items: items.map(i => ({
      id: i.id, productId: i.productId, productTitle: i.productTitle,
      quantity: i.quantity, price: Number(i.price), currency: i.currency,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId)).orderBy(ordersTable.createdAt);
  const result = [];
  for (const o of orders) {
    const full = await getOrderWithItems(o.id);
    if (full) result.push(full);
  }
  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (cartItems.length === 0) { res.status(400).json({ error: "Carrinho vazio" }); return; }

  let total = 0;
  const orderItemsData = [];
  for (const ci of cartItems) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, ci.productId));
    if (!product) continue;
    const lineTotal = Number(product.price) * ci.quantity;
    total += lineTotal;
    orderItemsData.push({ productId: ci.productId, productTitle: product.title, quantity: ci.quantity, price: String(product.price), currency: product.currency });
  }

  const trackingCode = `GM-${Date.now().toString(36).toUpperCase()}`;
  const [order] = await db.insert(ordersTable).values({
    userId, status: "confirmed", total: String(total), currency: "EUR",
    shippingAddress: parsed.data.shippingAddress,
    shippingCountry: parsed.data.shippingCountry,
    trackingCode,
  }).returning();

  for (const item of orderItemsData) {
    await db.insert(orderItemsTable).values({ orderId: order.id, ...item });
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  await db.insert(notificationsTable).values({
    userId,
    title: "Encomenda confirmada!",
    message: `A sua encomenda #${order.id} foi confirmada. Código de rastreio: ${trackingCode}`,
    type: "order",
    isRead: false,
  });

  const full = await getOrderWithItems(order.id);
  res.status(201).json(full);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const full = await getOrderWithItems(id);
  if (!full || full.userId !== userId) { res.status(404).json({ error: "Encomenda não encontrada" }); return; }
  res.json(full);
});

export default router;
