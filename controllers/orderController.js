// import { Order } from "../models/orderModel.js";

// // GET MY ORDERS
// export const getMyOrders = async (req, res) => {
//     try {
//         // req.user._id authentication middleware se aayega
//         const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

//         return res.status(200).json({
//             success: true,
//             orders
//         });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

// // CREATE NEW ORDER (Jab checkout successfully ho jaye)
// export const createOrder = async (req, res) => {
//     try {
//         const { orderItems, shippingAddress, totalPrice } = req.body;

//         if (!orderItems || orderItems.length === 0) {
//             return res.status(400).json({ message: "No order items" });
//         }

//         const order = new Order({
//             user: req.user._id,
//             orderItems,
//             shippingAddress,
//             totalPrice
//         });

//         const createdOrder = await order.save();
//         res.status(201).json({ success: true, order: createdOrder });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// AAJ

import { Order } from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

export const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstName lastName email')
            .populate('products.productId', 'productName productPrice')
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};




export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate("userId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    // 🔥 EMAIL LOGIC (IMPORTANT)
    const sendMailStatuses = [
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (sendMailStatuses.includes(status) && order.userId?.email) {
      await sendEmail(
        order.userId.email,
        "Order Status Update",
        `Hello ${order.userId.firstName || 'Customer'},

Your order status has been updated to: ${status}

Thank you for shopping with us!`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Is function ko apne controller mein add karein
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate({
        path: "products.productId",
        select: "productName productPrice productImg",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.log("ORDER DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    console.log("USER ID:", req.id);

    // 🔥 Step 1: simple query (no populate)
    let orders = await Order.find({ userId: req.id })
      .sort({ createdAt: -1 });

    console.log("RAW ORDERS:", orders);

    // 🔥 Step 2: safe populate manually
    orders = await Order.populate(orders, {
      path: "products.productId",
      select: "productName productPrice",
    });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    console.log("❌ MY ORDERS ERROR FULL:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔥 only allow cancel in early stages
    const allowedStatuses = ["Processing", "Packed"];

    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};