import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Mengambil data spesifik berdasarkan ID dari Backend
        const res = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error("Gagal ambil detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="text-center mt-20 font-bold">Sedang menyiapkan resep... 👨‍🍳</div>;
  
  if (!recipe) return (
    <div className="text-center mt-20">
      <h2 className="text-xl font-bold">Resep tidak ditemukan! 😟</h2>
      <button onClick={() => navigate(-1)} className="text-pink-500 underline mt-4">Kembali</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-6 font-['Quicksand']">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
        {/* Header Image */}
        <div className="relative h-80">
          <img src={recipe.image} alt={recipe.nama} className="w-full h-full object-cover" />
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg hover:bg-white transition-all"
          >
            ⬅️ Kembali
          </button>
        </div>

        <div className="p-8">
          <h1 className="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tight">{recipe.nama}</h1>
          
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-blue-50 p-4 rounded-3xl text-center border-2 border-blue-100">
              <p className="text-[10px] font-bold text-blue-400 uppercase">Modal</p>
              <p className="text-lg font-black text-blue-700">Rp {recipe.modal?.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-3xl text-center border-2 border-green-100">
              <p className="text-[10px] font-bold text-green-400 uppercase">Jual</p>
              <p className="text-lg font-black text-green-700">Rp {recipe.jual?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-3xl text-center border-2 border-purple-100">
              <p className="text-[10px] font-bold text-purple-400 uppercase">Porsi</p>
              <p className="text-lg font-black text-purple-700">{recipe.porsi} Porsi</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-black text-pink-500 mb-3 flex items-center gap-2">
                <span>🛒</span> Bahan-bahan
              </h3>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                <p className="whitespace-pre-line text-slate-600 font-medium leading-relaxed">
                  {recipe.bahan || "Belum ada rincian bahan."}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-orange-500 mb-3 flex items-center gap-2">
                <span>👨‍🍳</span> Cara Membuat
              </h3>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                <p className="whitespace-pre-line text-slate-600 font-medium leading-relaxed">
                  {recipe.langkah || "Belum ada rincian langkah."}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}