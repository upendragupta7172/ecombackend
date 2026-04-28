



import { Cart } from "../models/Cart.js";

// Helper function to get populated cart
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate("items.product");
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });
    } else {
      const index = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (index > -1) {
        cart.items[index].quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }
      await cart.save();
    }

    // FIX: Populate after save
    const updatedCart = await getPopulatedCart(userId);
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    let cart = await getPopulatedCart(req.id);
    
    // If cart doesn't exist, return empty items array
    if (!cart) {
      return res.status(200).json({ success: true, items: [], message: "Cart is empty" });
    }
    
    res.status(200).json({ success: true, items: cart.items || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.id });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    // FIX: Populate after remove
    const updatedCart = await getPopulatedCart(req.id);
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { productId, type } = req.body;
    const cart = await Cart.findOne({ user: req.id });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (type === "increase") item.quantity += 1;
    if (type === "decrease" && item.quantity > 1) item.quantity -= 1;

    await cart.save();
    const updatedCart = await getPopulatedCart(req.id);
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};