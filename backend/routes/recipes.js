const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// 1. AMBIL SEMUA MENU (Untuk Dashboard)
router.get('/', async (req, res) => {
  try {
    const data = await Recipe.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil semua data" });
  }
});

// 2. AMBIL SATU MENU (UNTUK HALAMAN DETAIL) - INI YANG TADI KURANG
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Resep tidak ditemukan di database" });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: "ID tidak valid atau error server" });
  }
});

// 3. TAMBAH MENU BARU (POST)
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const saved = await newRecipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Gagal simpan: Data tidak valid" });
  }
});

// 4. UPDATE MENU (PUT)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "Gagal update data" });
  }
});

// 5. HAPUS MENU (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus" });
  }
});

module.exports = router;