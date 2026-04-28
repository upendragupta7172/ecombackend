
// new



import e from "express";
const router = e.Router();
import { login, register, reVerify, varify ,logout, forgotPassword, verifyOTP, changePassword, allUser, updateProfile, } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { singleupload } from "../middleware/multer.js";
import { getMyOrders } from "../controllers/orderController.js";

router.post('/registeruser', register);
router.post('/varify', varify);
router.post('/reverify', reVerify);
router.post('/login', login);
router.post("/logout", isAuthenticated , logout)
router.post('/forgetpassword' ,forgotPassword)

router.post('/verifyotp/:email' ,verifyOTP)
router.post('/changePassword/:email' ,changePassword)
router.get('/all-user' ,isAuthenticated, isAdmin, allUser)
router.get('/all-user/:userid' , allUser)
router.put('/update/:id' ,isAuthenticated , singleupload )

// aaj

router.get("/my", isAuthenticated, getMyOrders);

router.put("/profile/update", isAuthenticated, updateProfile);



export default router;



