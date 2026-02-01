import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      alert("Selamat Datang, Chef! ✨");
      navigate("/");
    } catch (err) {
      alert("Username atau Password salah! ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center font-['Quicksand'] p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-b-[10px] border-pink-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#1B263B] mb-2">Welcome Back!</h1>
          <p className="text-pink-500 font-bold italic text-sm">“Siap hitung cuan? 💸✨”</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 border-slate-100 font-bold outline-none focus:border-pink-300 transition-all" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 border-slate-100 font-bold outline-none focus:border-pink-300 transition-all" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="w-full py-5 bg-[#1B263B] text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-pink-500 transition-all">Masuk Sekarang 🚀</button>
        </form>
        <div className="mt-10 text-center text-slate-500 font-medium">
          Belum punya akun? <Link to="/register" className="text-pink-500 font-black hover:underline">Daftar Disini ✨</Link>
        </div>
      </div>
    </div>
  );
}