




import{ Product }  from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js"; // Path check karlein (utils/ ya config/)
import getDataUri from "../utils/dataUri.js";

// --- ADD PRODUCT ---
export const addProduct = async (req, res) => {
  try {
    const { productName, productDesc, productPrice, category, brand } = req.body;
    const userId = req.id; // Yeh middleware se aayega

    if (!productName || !productDesc || !productPrice || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    let productImg = [];

    // Upload Multiple Images
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        
        // Cloudinary upload with proper error catch
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "mern_products"
        });

        productImg.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    } else {
        return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    const newProduct = await Product.create({
      userId,
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      productImg,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    });

  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// --- GET ALL PRODUCTS (With Filters) ---
export const getAllProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice } = req.query;
        let query = {};

        if (keyword) query.productName = { $regex: keyword, $options: "i" };
        if (category && category !== "All") query.category = category;
        if (brand && brand !== "All") query.brand = brand;
        
        if (minPrice || maxPrice) {
            query.productPrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || 999999
            };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELETE PRODUCT ---
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Cloudinary se purani images delete karna
        if (product.productImg && product.productImg.length > 0) {
            for (let img of product.productImg) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product and associated images deleted"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE PRODUCT ---
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Handling Images if new files are uploaded
        if (req.files && req.files.length > 0) {
            // Delete old ones from Cloudinary
            if (product.productImg && product.productImg.length > 0) {
                for (let img of product.productImg) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }

            // Upload new ones
            let newImages = [];
            for (let file of req.files) {
                const fileUri = getDataUri(file);
                const result = await cloudinary.uploader.upload(fileUri, {
                    folder: "mern_products"
                });
                newImages.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
            req.body.productImg = newImages;
        }

        // Final Update
        product = await Product.findByIdAndUpdate(productId, { $set: req.body }, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};