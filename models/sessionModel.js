import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Yeh aapke User model se link karega
        required: true
    }
}, { timestamps: true }); // Isse createdAt aur updatedAt fields automatically ban jayengi

export const Session = mongoose.model('Session', sessionSchema);