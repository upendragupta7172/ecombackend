// import Razorpay from 'razorpay';
// import crypto from 'crypto';

// const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // 1. Order Create Karna
// export const checkout = async (req, res) => {
//     try {
//         const options = {
//             amount: Number(req.body.amount * 100), // Amount paise mein hota hai (₹1 = 100 paise)
//             currency: "INR",
//         };
//         const order = await instance.orders.create(options);

//         res.status(200).json({
//             success: true,
//             order,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Order creation failed" });
//     }
// };

// // 2. Payment Verification
// export const paymentVerification = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         const body = razorpay_order_id + "|" + razorpay_payment_id;

//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         const isAuthentic = expectedSignature === razorpay_signature;

//         if (isAuthentic) {
//             // Yahan aap Database mein Order save kar sakte hain
//             // Example: await Order.create({ ...req.body, user: req.user._id });

//             res.status(200).json({
//                 success: true,
//                 message: "Payment Verified Successfully"
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: "Invalid Signature, Payment Failed"
//             });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };


// new

import Razorpay from 'razorpay';
import crypto from 'crypto';
import easyinvoice from 'easyinvoice';
// aaj
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js"; // Model import karna na bhoolein

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Order Create Karna
export const checkout = async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100), 
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

// 2. Payment Verification
// export const paymentVerification = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         const body = razorpay_order_id + "|" + razorpay_payment_id;

//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         const isAuthentic = expectedSignature === razorpay_signature;

//         if (isAuthentic) {
//             // ✅ Yahan Order ko database mein save karein (isPaid: true)
//             // await Order.create({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, status: "Paid" });

//             res.status(200).json({
//                 success: true,
//                 orderId: razorpay_order_id, // Frontend Redirect ke liye
//                 message: "Payment Verified Successfully"
//             });
//         } else {
//             res.status(400).json({ success: false, message: "Invalid Signature" });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };


// aaj


export const paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        // 1. Signature Verification String
        // Iska format exact order_id + "|" + payment_id hona chahiye
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // Verify karein ki .env load ho raha hai
            .update(sign.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 2. Database mein Order Save karein
            // Note: orderData frontend se aana chahiye jisme products array ho
            await Order.create({
                userId: req.id, // Middleware se user id
                products: orderData.products, 
                totalAmount: orderData.amount,
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                status: "Processing"
            });

            // 3. Order successful hone ke baad Cart khali karein
            await Cart.findOneAndDelete({ user: req.id });

            return res.status(200).json({
                success: true,
                message: "Payment Verified & Order Placed Successfully"
            });
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed: Signature Mismatch" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



// 3. Invoice Generation
export const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Note: Asli project mein data database se fetch karein
        const data = {
            "customize": {},
            "images": {
                "logo": "https://public.easyinvoice.cloud/img/logo_en_trans.png", 
            },
            "sender": {
                "company": "Upendra's Store",
                "address": "Software Park, Tech City",
                "zip": "110001",
                "city": "Delhi",
                "country": "India"
            },
            "client": {
                "company": "Valued Customer",
                "address": "Customer Address Street",
                "zip": "400001",
                "city": "Mumbai",
                "country": "India"
            },
            "information": {
                "number": orderId.substring(6),
                "date": new Date().toLocaleDateString(),
            },
            "products": [
                {
                    "quantity": 1,
                    "description": "Premium E-commerce Product",
                    "tax-rate": 18,
                    "price": 138646
                }
            ],
            "bottom-notice": "Thank you for shopping with Upendra Gupta!",
            "settings": {
                "currency": "INR",
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