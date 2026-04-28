// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     orderItems: [
//         {
//             name: { type: String, required: true },
//             qty: { type: Number, required: true },
//             image: { type: String, required: true },
//             price: { type: Number, required: true },
//             product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//         }
//     ],
//     shippingAddress: {
//         address: { type: String, required: true },
//         city: { type: String, required: true },
//         zipCode: { type: String, required: true },
//     },
//     paymentMethod: { type: String, default: "Razorpay" },
//     totalPrice: { type: Number, required: true },
//     isPaid: { type: Boolean, default: true },
//     paidAt: { type: Date, default: Date.now },
// }, { timestamps: true });

// export const Order = mongoose.model("Order", orderSchema);


// AAJ
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],

    status: {
      type: String,
      enum: [
        "Processing",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);