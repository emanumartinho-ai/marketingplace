import { Router } from "express";

const router = Router();

const COUNTRIES = [
  // Europa
  { name: "Portugal", region: "Europa" },
  { name: "Espanha", region: "Europa" },
  { name: "França", region: "Europa" },
  { name: "Alemanha", region: "Europa" },
  { name: "Itália", region: "Europa" },
  { name: "Reino Unido", region: "Europa" },
  { name: "Holanda", region: "Europa" },
  { name: "Bélgica", region: "Europa" },
  { name: "Suíça", region: "Europa" },
  // Africa
  { name: "Angola", region: "Africa" },
  { name: "Moçambique", region: "Africa" },
  { name: "Cabo Verde", region: "Africa" },
  { name: "São Tomé", region: "Africa" },
  { name: "Guiné-Bissau", region: "Africa" },
  { name: "Senegal", region: "Africa" },
  { name: "Nigeria", region: "Africa" },
  { name: "Gana", region: "Africa" },
  { name: "Quénia", region: "Africa" },
];

router.get("/countries", (_req, res) => {
  return res.json(COUNTRIES);
});

export default router;
