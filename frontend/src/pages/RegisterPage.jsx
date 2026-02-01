import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { username, email, password });
      alert("Akun Berhasil Dibuat! Yuk Login ✨");
      navigate("/login");
    } catch (err) {
      alert("Gagal Daftar! Coba username/email lain. ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center font-['Quicksand'] p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-b-[10px] border-pink-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#1B263B] mb-2">Join FoodCost!</h1>
          <p className="text-pink-500 font-bold italic text-sm">“Buat akun chef kamu 🌸”</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Username (Untuk Login)" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 font-bold outline-none focus:border-pink-300" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 font-bold outline-none focus:border-pink-300" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 font-bold outline-none focus:border-pink-300" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full py-5 bg-[#FF748D] text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1B263B] transition-all">Daftar Sekarang ✨</button>
        </form>
        <div className="mt-8 text-center text-slate-500 font-medium">
          Sudah punya akun? <Link to="/login" className="text-[#1B263B] font-black hover:underline">Login Disini 🚀</Link>
        </div>
      </div>
    </div>
  );
}