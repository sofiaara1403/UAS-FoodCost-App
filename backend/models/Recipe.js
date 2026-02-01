const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  image: { type: String, required: true },
  modal: { type: Number, default: 0 },
  jual: { type: Number, default: 0 },
  porsi: { type: Number, default: 1 },
  bahan: { type: String, default: "" },
  langkah: { type: String, default: "" },
  createdBy: { type: String, default: "Chef" }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);