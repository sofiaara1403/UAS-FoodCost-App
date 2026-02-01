const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 

// Load environment variables
dotenv.config();

// Inisialisasi Aplikasi
const app = express();

// Connect ke Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- PERBAIKAN DI SINI ---
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth'); // Nama file disesuaikan jadi auth.js sesuai folder kamu

// Menggunakan Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);

// Route testing sederhana
app.get('/', (req, res) => {
  res.send('Server FoodCost Berjalan Lancar Chef! 🍲');
});

// Port Setting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});