import express from 'express';
import { checkout, generateInvoice, paymentVerification } from '../controllers/paymentController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
// import { isAuthenticated } from '../middlewares/auth.js'; 

const router = express.Router();

router.route('/checkout').post(isAuthenticated, checkout);
router.route('/verify').post(isAuthenticated, paymentVerification);
router.get("/invoice/:orderId", generateInvoice);

export default router;