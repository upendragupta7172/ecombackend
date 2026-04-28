// // import mongoose from "mongoose";

// // const CartSchema = new mongoose.Schema({
// //     // Isse pata chalega ye kiska cart hai
// //     userId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "User", // Aapke User model ka naam
// //         required: true
// //     },
// //     // Items ek array hai kyunki ek cart mein bahut saare products ho sakte hain
// //     items: [
// //         {
// //             productId: {
// //                 type: mongoose.Schema.Types.ObjectId,
// //                 ref: "Product", // Aapke Product model ka naam
// //                 required: true
// //             },
// //             quantity: {
// //                 type: Number,
// //                 default: 1,
// //                 min: 1
// //             }
// //         }
// //     ]
// // }, { timestamps: true });

// // export default mongoose.model("Cart", CartSchema);






import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ]
}, { timestamps: true });

export const Cart = mongoose.model("Cart", cartSchema);