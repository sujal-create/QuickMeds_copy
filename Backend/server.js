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
import paymentRoute from './routes/paymentRoutes.js'; // ✅ Added this line

dotenv.config();
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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoute); // ✅ Registered here
app.use("/api/medicines", medicineRoutes);
// Default route
app.get('/', (req, res) => {
  res.send('QuickMeds API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
