import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, title: p.title, description: p.description,
    price: Number(p.price), currency: p.currency, category: p.category,
    country: p.country, sellerId: p.sellerId, sellerName: p.sellerName,
    stock: p.stock, imageUrl: p.imageUrl, isFeatured: p.isFeatured,
    shippingInfo: p.shippingInfo, createdAt: p.createdAt.toISOString(),
  };
}

async function getCartWithProducts(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const result = [];
  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (product) {
      result.push({ id: item.id, productId: item.productId, quantity: item.quantity, product: formatProduct(product) });
    }
  }
  return result;
}

router.get("/cart", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }
  res.json(await getCartWithProducts(userId));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { productId, quantity } = parsed.data;
  const [existing] = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  let item;
  if (existing) {
    [item] = await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id)).returning();
  } else {
    [item] = await db.insert(cartItemsTable).values({ userId, productId, quantity }).returning();
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  res.status(201).json({ id: item.id, productId: item.productId, quantity: item.quantity, product: formatProduct(product) });
});

router.patch("/cart/items/:productId", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [item] = await db.update(cartItemsTable).set({ quantity: parsed.data.quantity })
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId))).returning();
  if (!item) { res.status(404).json({ error: "Item não encontrado" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  res.json({ id: item.id, productId: item.productId, quantity: item.quantity, product: formatProduct(product) });
});

router.delete("/cart/items/:productId", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  res.json({ message: "Item removido do carrinho" });
});

export default router;
