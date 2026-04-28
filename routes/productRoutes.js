import express from "express";
import { 
    addProduct, 
    getAllProducts, 
    deleteProduct, 
    updateProduct 
} from "../controllers/productController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { multipleUpload } from "../middleware/multer.js"; 

const router = express.Router();

// 1. Add Product: /api/user/product/add
router.post("/add", isAuthenticated, multipleUpload, addProduct);

// 2. Get All Products: /api/user/product/getallproducts
// Frontend URL se match karne ke liye path ko '/getallproducts' kar diya
router.get("/getallproducts", getAllProducts); 

// 3. Delete Product: /api/user/product/delete/:id
router.delete("/delete/:id", isAuthenticated, deleteProduct);

// 4. Update Product: /api/user/product/update/:id
router.put("/update/:id", isAuthenticated, multipleUpload, updateProduct);

export default router;