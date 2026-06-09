import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

function makeToken(userId: number) {
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString("base64");
}

const sessions = new Map<string, number>();

export function getUserIdFromToken(token: string | undefined): number | null {
  if (!token) return null;
  const userId = sessions.get(token);
  return userId ?? null;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, phone, country, address } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email já registado" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name, email, password: hashPassword(password), phone, country, address: address ?? null,
  }).returning();
  const token = makeToken(user.id);
  sessions.set(token, user.id);
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, country: user.country, address: user.address, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.password !== hashPassword(password)) {
    res.status(401).json({ error: "Email ou palavra-passe incorretos" });
    return;
  }
  const token = makeToken(user.id);
  sessions.set(token, user.id);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, country: user.country, address: user.address, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/logout", (req, res): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) sessions.delete(token);
  res.json({ message: "Sessão terminada" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Utilizador não encontrado" }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, country: user.country, address: user.address, createdAt: user.createdAt.toISOString() });
});

export default router;
