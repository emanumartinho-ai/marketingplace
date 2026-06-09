import { Router, type Request } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function isAdmin(req: Request): boolean {
  if (!req.isAuthenticated()) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  return req.user.role === "admin" || (!!adminEmail && req.user.email === adminEmail);
}

function serializeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    profileImageUrl: u.profileImageUrl,
    approved: u.approved,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users/me", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(serializeUser(user));
});

router.get("/users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  return res.json(users.map(serializeUser));
});

router.patch("/users/:id/approve", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const [user] = await db
    .update(usersTable)
    .set({ approved: true })
    .where(eq(usersTable.id, req.params.id))
    .returning();

  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(serializeUser(user));
});

router.patch("/users/:id/reject", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const [user] = await db
    .update(usersTable)
    .set({ approved: false })
    .where(eq(usersTable.id, req.params.id))
    .returning();

  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(serializeUser(user));
});

export { isAdmin };
export default router;
