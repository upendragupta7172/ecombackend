import Razorpay from 'razorpay';
import crypto from 'crypto';
import easyinvoice from 'easyinvoice';
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const checkout = async (req, res) => {
    try {
        const amount = Number(req.body.amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid amount is required",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
        };
        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
};

export const paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Signature mismatch",
            });
        }

        const normalizedProducts = Array.isArray(orderData?.products)
            ? orderData.products.filter(
                  (product) => product?.productId && Number(product?.quantity) > 0
              )
            : [];

        if (!normalizedProducts.length) {
            return res.status(400).json({
                success: false,
                message: "No valid products were provided for the order",
            });
        }

        const createdOrder = await Order.create({
            userId: req.id,
            products: normalizedProducts.map((product) => ({
                productId: product.productId,
                quantity: Number(product.quantity),
            })),
            totalAmount: Number(orderData?.amount) || 0,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            status: "Processing"
        });

        await Cart.findOneAndDelete({ user: req.id });

        return res.status(200).json({
            success: true,
            orderId: createdOrder._id,
            message: "Payment verified and order placed successfully",
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("userId", "firstName lastName address city zipCode")
            .populate({
                path: "products.productId",
                select: "productName productPrice",
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const invoiceProducts = order.products
            .filter((product) => product.productId)
            .map((product) => ({
                quantity: product.quantity,
                description: product.productId.productName,
                "tax-rate": 18,
                price: Number(product.productId.productPrice || 0),
            }));

        const customerName =
            [order.userId?.firstName, order.userId?.lastName].filter(Boolean).join(" ") ||
            "Valued Customer";

        const data = {
            customize: {},
            images: {
                logo: "https://public.easyinvoice.cloud/img/logo_en_trans.png",
            },
            sender: {
                company: "Upendra's Store",
                address: "Software Park, Tech City",
                zip: "110001",
                city: "Delhi",
                country: "India"
            },
            client: {
                company: customerName,
                address: order.userId?.address || "Address not provided",
                zip: order.userId?.zipCode || "",
                city: order.userId?.city || "",
                country: "India"
            },
            information: {
                number: order._id.toString().slice(-6),
                date: new Date(order.createdAt).toLocaleDateString("en-IN"),
            },
            products: invoiceProducts,
            bottomNotice: `Thank you for shopping with us. Order status: ${order.status}`,
            settings: {
                currency: "INR",
            }
        };

        const result = await easyinvoice.createInvoice(data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
        res.send(Buffer.from(result.pdf, 'base64'));
    } catch (error) {
        console.error("Invoice Error:", error);
        res.status(500).send("Could not generate invoice");
    }
};
