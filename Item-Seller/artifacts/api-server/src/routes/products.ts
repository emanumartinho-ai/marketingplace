import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, UpdateProductBody, GetProductParams, UpdateProductParams, DeleteProductParams } from "@workspace/api-zod";
import { getUserIdFromToken } from "./auth";
import { usersTable } from "@workspace/db";

const router: IRouter = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    currency: p.currency,
    category: p.category,
    country: p.country,
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    stock: p.stock,
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    shippingInfo: p.shippingInfo,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const { country, category, search, minPrice, maxPrice } = params.data;

  const conditions = [];
  if (country) conditions.push(eq(productsTable.country, country));
  if (category) conditions.push(eq(productsTable.category, category));
  if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));

  const products = conditions.length
    ? await db.select().from(productsTable).where(and(...conditions)).orderBy(productsTable.createdAt)
    : await db.select().from(productsTable).orderBy(productsTable.createdAt);

  res.json(products.map(formatProduct));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(8);
  res.json(products.map(formatProduct));
});

router.get("/products/categories", async (_req, res): Promise<void> => {
  const rows = await db.select({
    category: productsTable.category,
    count: sql<number>`cast(count(*) as int)`,
  }).from(productsTable).groupBy(productsTable.category);
  res.json(rows);
});

router.post("/products", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Utilizador não encontrado" }); return; }

  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    sellerId: userId,
    sellerName: user.name,
    isFeatured: parsed.data.isFeatured ?? false,
    imageUrl: parsed.data.imageUrl ?? null,
    shippingInfo: parsed.data.shippingInfo ?? null,
  }).returning();

  res.status(201).json(formatProduct(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Produto não encontrado" }); return; }
  res.json(formatProduct(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updates.price = String(parsed.data.price);
  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Produto não encontrado" }); return; }
  res.json(formatProduct(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Produto não encontrado" }); return; }
  res.json({ message: "Produto eliminado" });
});

export default router;
