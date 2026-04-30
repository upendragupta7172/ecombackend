import { Order } from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .populate("products.productId", "productName productPrice")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "firstName lastName email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    const sendMailStatuses = [
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (sendMailStatuses.includes(status) && order.userId?.email) {
      const customerName =
        [order.userId.firstName, order.userId.lastName].filter(Boolean).join(" ") ||
        "Customer";

      await sendEmail(
        order.userId.email,
        "Order Status Update",
        `Hello ${customerName},

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

export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "firstName lastName email role")
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

    const isOwner = order.userId?._id?.toString() === req.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
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
    const orders = await Order.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.productId",
        select: "productName productPrice productImg",
      });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
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

    const isOwner = order.userId?.toString() === req.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this order",
      });
    }

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
      order,
    });
  } catch (error) {
    console.log("CANCEL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
