

import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  getOrderDetails,
  getMyOrders,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ ADMIN ROUTES
router.get("/admin/all", isAuthenticated, isAdmin, getAllOrdersAdmin);
router.put("/status/:id", isAuthenticated, isAdmin, updateOrderStatus);

// ✅ USER ROUTES
router.get("/my", isAuthenticated, getMyOrders);   // 🔥 THIS WAS MISSING / WRONG

// ✅ ORDER DETAILS
router.get("/:id", isAuthenticated, getOrderDetails);

router.put("/cancel/:id", isAuthenticated, cancelOrder);

export default router;