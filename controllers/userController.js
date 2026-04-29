
// new



import { User } from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyemail } from "../emailverify/verifyemail.js";
import { Session } from "../models/sessionModel.js";
import { sendOTPMail } from "../emailverify/sendOTPMail.js";
// import cloudinary from "../config/cloudinary.js";

import cloudinary from "../utils/cloudinary.js";


export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashedPassword });

        // Email Verification Token (10 days expiry logic consistent rakha hai)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        
        await verifyemail(token, email);

        user.token = token;
        await user.save();

        return res.json({ success : true ,message: "Registered successfully. Please verify email.", user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- VERIFY EMAIL ---
export const varify = async (req, res) => {
    try {
        // Handle token from params or Authorization header
        const token = req.params.token || req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ success: false, message: "Token missing" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByIdAndUpdate(decoded.id, { isVerified: true, token: null }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, message: "Account verified successfully!" });
    } catch (error) {
        console.error("Verify Email Error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// --- LOGIN ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "All fields required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid Credentials" });

        if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify email first" });

        if (!process.env.JWT_SECRET) {
            console.error("FATAL ERROR: JWT_SECRET is not defined.");
            return res.status(500).json({ success: false, message: "Internal server configuration error" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Password hide karke response bhejna
        const userResponse = await User.findById(user._id).select("-password");

        // Security: Use 'secure: true' in production for HTTPS
        res.cookie("token", token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        return res.status(200).json({
            success: true,
            message: `Welcome ${user.firstName}`,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};










export const reVerify = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Already verified" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        await verifyemail(token, email);

        user.token = token;
        await user.save();

        res.json({ success: true, message: "New verification link sent!" });
    } catch (error) {
        console.error("Reverify Error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const logout = async (req, res) => {
    try {
        const userId = req.id; // Yeh middleware se aayega

        // 1. Delete all sessions for this user
        await Session.deleteMany({ userId: userId });

        // 2. Update user status in database
        await User.findByIdAndUpdate(userId, { isLoggedIn: false });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // 6 digit OTP generate karna
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 10 minutes ki expiry set karna
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        user.otp = otp;
        user.otpExpiry = otpExpiry;

        await user.save();
        
        // Email bhejne ka function call
        await sendOTPMail(otp, email);

        return res.status(200).json({
            success: true,
            message: "Otp sent to email successfully"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.params.email; // Image ke mutabiq aap params se email le rahe hain

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Otp is required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // OTP Match Check
        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Expiry Check
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Verification Success: OTP clear karein aur status update karein
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { email } = req.params;

        // 1. User ko dhoondo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // 2. Check karo ki dono password field bhari hain aur aapas mein match karti hain
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Both password fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            });
        }

        // 3. Naye password ko hash karo (await zaroori hai)
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 4. Database mein update karo
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const allUser = async (_, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("All Users Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const getUserById = async (req, res) => {
    try {
        // 1. URL se ID nikaalo (e.g., /getuser/12345)
        const { id } = req.params;

        // 2. Database mein dhoondo aur sensitive data (password) hata do
        const user = await User.findById(id).select("-password");

        // 3. Agar user nahi mila
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 4. Success Response
        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get User By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Invalid ID format or Server Error"
        });
    }
};






export const updateUser = async (req, res) => {
    try {
        const userIdToUpdate = req.params.id; // User ID from URL
        const loggedInUser = req.user; // From isAuthenticated middleware
        const { firstName, lastName, address, city, zipCode, phoneNo } = req.body;

        // 1. Authorization Check
        if (loggedInUser._id.toString() !== userIdToUpdate && loggedInUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this profile"
            });
        }

        // 2. Find User in Database
        let user = await User.findById(userIdToUpdate);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let profilePicUrl = user.profilePic;
        let profilePicPublicId = user.profilePicPublicId;

        // 3. Handle File Upload (If new file exists)
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (profilePicPublicId) {
                await cloudinary.uploader.destroy(profilePicPublicId);
            }

            // Upload new image using Stream
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profiles" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer); // Pushing file buffer to stream
            });

            // Update variables with new Cloudinary data
            profilePicUrl = uploadResult.secure_url;
            profilePicPublicId = uploadResult.public_id;
        }

        // 4. Update Database Fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.address = address || user.address;
        user.city = city || user.city;
        user.zipCode = zipCode || user.zipCode;
        user.phoneNo = phoneNo || user.phoneNo;
        
        // Update profile picture info
        user.profilePic = profilePicUrl;
        user.profilePicPublicId = profilePicPublicId;

        // Save updated user to DB
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error("Update User Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};




export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body; // Frontend se 'name' aur 'phone' aa raha hai

    // req.id check karein ki isAuthenticated middleware ise set kar raha hai ya nahi
    const user = await User.findById(req.id); 

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // UPDATE LOGIC: Model ke hisaab se mapping
    if (name) {
        // Agar aap 'name' ko 'firstName' mein save karna chahte hain
        user.firstName = name; 
    }
    if (phone) {
        // Model mein 'phoneNo' hai, 'phone' nahi
        user.phoneNo = phone; 
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user // Updated user wapas bhej rahe hain
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};