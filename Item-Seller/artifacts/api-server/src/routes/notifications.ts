import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

function formatNotif(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id, userId: n.userId, title: n.title, message: n.message,
    type: n.type, isRead: n.isRead, createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }
  const notifs = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).orderBy(notificationsTable.createdAt);
  res.json(notifs.map(formatNotif));
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [notif] = await db.update(notificationsTable).set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId))).returning();
  if (!notif) { res.status(404).json({ error: "Notificação não encontrada" }); return; }
  res.json(formatNotif(notif));
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.json({ message: "Todas as notificações marcadas como lidas" });
});

export default router;
