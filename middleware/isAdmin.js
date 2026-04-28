export const isAdmin = (req, res, next) => {
    try {
        // req.user check karta hai ki user logged in hai aur uska role 'admin' hai
        if (req.user && req.user.role === 'admin') {
            next(); // Agar admin hai toh aage badhne do
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied: admins only"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};