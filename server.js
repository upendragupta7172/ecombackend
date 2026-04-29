

import express from "express";
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRoutes from "./routes/cartRoutes.js";
// ✅ 1. PAYMENT ROUTE IMPORT KAREIN
import paymentRoutes from "./routes/paymentRoutes.js"; 
// import orderRouter from "./routes/orderRoutes.js"; // Naya router import

import orderRouter from "./routes/orderRoutes.js";

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config(); // ✅ 2. Env variables load karein

const app = express();

app.use(cookieParser());
app.use(express.json());




// Multiple origins ko support karne ke liye array banayein
// const allowedOrigins = [
//   "https://ecom-git-main-upendra-guptas-projects.vercel.app", // ✅ frontend
//   "http://localhost:5173",                         // Development (Vite)
//   "http://localhost:800"                           // Development (Agar port 800 use kar rahe ho)
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or Postman)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));



const allowedOrigins = [
  "https://ecom-git-main-upendra-guptas-projects.vercel.app", // ✅ frontend
  "http://localhost:5173",
  "http://localhost:800"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ROUTES
app.use('/api/user', userRouter);
app.use('/api/user/product', productRouter);
app.use('/api/v1/cart', cartRoutes);
// app.use("/api/v1/orders", orderRouter);

// ✅ 3. SAHI NAAM SE REGISTER KAREIN
// (Ye line aapke URL ke '/api/v1/payment' part ko handle karegi)
app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/orders", orderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});


// // TODAY

