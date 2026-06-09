import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res) => {
  const results = await db
    .select({
      name: productsTable.category,
      productCount: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);

  return res.json(results);
});

export default router;
