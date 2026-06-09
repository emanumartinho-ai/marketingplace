import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, and, or, type SQL } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

const EUROPE = ["Portugal", "Espanha", "França", "Alemanha", "Itália", "Reino Unido", "Holanda", "Bélgica", "Suíça"];
const AFRICA = ["Angola", "Moçambique", "Cabo Verde", "São Tomé", "Guiné-Bissau", "Senegal", "Nigeria", "Gana", "Quénia"];

function serialize(p: typeof productsTable.$inferSelect) {
  return { ...p, price: Number(p.price), createdAt: p.createdAt.toISOString() };
}

// GET /products
router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query params" });

  const { category, country, search, featured, region, sellerId } = parsed.data as typeof parsed.data & { sellerId?: string };
  const conditions: SQL[] = [];

  if (category) conditions.push(eq(productsTable.category, category));
  if (country) conditions.push(eq(productsTable.country, country));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (featured !== undefined) conditions.push(eq(productsTable.featured, featured));
  if (region) {
    const regionList = region.toLowerCase() === "europa" ? EUROPE : AFRICA;
    conditions.push(or(...regionList.map((c) => eq(productsTable.country, c)))!);
  }
  if (sellerId) conditions.push(eq(productsTable.sellerId, sellerId));

  const products = conditions.length > 0
    ? await db.select().from(productsTable).where(and(...conditions))
    : await db.select().from(productsTable);

  return res.json(products.map(serialize));
});

// GET /products/featured — must come before /:id
router.get("/products/featured", async (_req, res) => {
  const products = await db.select().from(productsTable).where(eq(productsTable.featured, true));
  return res.json(products.map(serialize));
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  if (!product) return res.status(404).send();
  return res.json(serialize(product));
});

// POST /products
router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const sellerId = req.isAuthenticated() ? req.user.id : null;

  const [product] = await db.insert(productsTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    price: String(parsed.data.price),
    currency: parsed.data.currency ?? "EUR",
    country: parsed.data.country,
    category: parsed.data.category,
    featured: parsed.data.featured ?? false,
    imageUrl: parsed.data.imageUrl,
    sellerId,
  }).returning();
  return res.status(201).json(serialize(product));
});

// PATCH /products/:id
router.patch("/products/:id", async (req, res) => {
  const paramsParsed = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: bodyParsed.error });

  const { price, ...rest } = bodyParsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (price !== undefined) updates.price = String(price);

  const [product] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, paramsParsed.data.id))
    .returning();

  if (!product) return res.status(404).send();
  return res.json(serialize(product));
});

// DELETE /products/:id
router.delete("/products/:id", async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
