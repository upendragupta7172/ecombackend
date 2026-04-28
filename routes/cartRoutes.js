



import express from "express";
import { addToCart, getCart ,removeFromCart , updateCart } from "../controllers/cartController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/add", isAuthenticated, addToCart);
router.get("/get", isAuthenticated, getCart);

router.post("/remove", isAuthenticated, removeFromCart);
router.post("/update", isAuthenticated, updateCart);

export default router;