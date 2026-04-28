



import jwt from "jsonwebtoken";
import { User } from "../models/User.js";


export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated. Please login again."
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decode.id; // Controller isi ID se user dhundega
        
        const user = await User.findById(decode.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        
        req.user = user; 
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
    }
};