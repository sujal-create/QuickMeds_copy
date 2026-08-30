import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import medicineRoutes from "./routes/medicineRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoute from './routes/paymentRoutes.js';

dotenv.config();
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
const app = express();

// Setup __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Static folder
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));

// MongoDB Connection
try {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected successfully");
} catch (err) {
  console.error("MongoDB FAILED:", err);
}

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoute);
app.use('/api/medicines', medicineRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('QuickMeds API is running...');
});

// Vercel ke liye
export default app;