import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import countriesRouter from "./countries";
import statsRouter from "./stats";
import usersRouter from "./users";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(countriesRouter);
router.use(statsRouter);

export default router;
