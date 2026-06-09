import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (_req, res) => {
  const [totals] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      featuredCount: sql<number>`count(*) filter (where ${productsTable.featured} = true)::int`,
    })
    .from(productsTable);

  const categories = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable);

  const countries = await db
    .selectDistinct({ country: productsTable.country })
    .from(productsTable);

  return res.json({
    totalProducts: totals?.totalProducts ?? 0,
    featuredCount: totals?.featuredCount ?? 0,
    totalCategories: categories.length,
    totalCountries: countries.length,
  });
});

export default router;
