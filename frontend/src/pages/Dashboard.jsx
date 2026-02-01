import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // --- STATE UNTUK EDIT ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form States
  const [namaMenu, setNamaMenu] = useState("");
  const [linkFoto, setLinkFoto] = useState(""); 
  const [modal, setModal] = useState(""); 
  const [jual, setJual] = useState("");   
  const [porsi, setPorsi] = useState(""); 
  const [bahan, setBahan] = useState("");   
  const [langkah, setLangkah] = useState(""); 

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/recipes");
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Gagal mengambil data"); }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('print-area');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("Daftar-Menu-Cuan.pdf");
  };

  const exportSingleRecipe = (item) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(219, 39, 119);
    doc.text(`${item.nama.toUpperCase()}`, 20, 20);
    doc.setDrawColor(219, 39, 119);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`RINCIAN BIAYA:`, 20, 35);
    doc.setFont("helvetica", "normal");
    doc.text(`- Modal: Rp ${Number(item.modal).toLocaleString()}`, 20, 42);
    doc.text(`- Harga Jual: Rp ${Number(item.jual).toLocaleString()}`, 20, 49);
    doc.text(`- Porsi: ${item.porsi} Porsi`, 20, 56);
    doc.setFont("helvetica", "bold");
    doc.text(`BAHAN-BAHAN:`, 20, 70);
    doc.setFont("helvetica", "normal");
    const txtBahan = doc.splitTextToSize(item.bahan || "-", 170);
    doc.text(txtBahan, 20, 77);
    const yLangkah = 85 + (txtBahan.length * 7);
    doc.setFont("helvetica", "bold");
    doc.text(`CARA MEMBUAT:`, 20, yLangkah);
    doc.setFont("helvetica", "normal");
    const txtLangkah = doc.splitTextToSize(item.langkah || "-", 170);
    doc.text(txtLangkah, 20, yLangkah + 7);
    doc.save(`Resep-${item.nama}.pdf`);
  };

  const exportToExcel = () => {
    const dataExcel = recipes.map((item, index) => {
      const untungBersih = (Number(item.jual) * Number(item.porsi)) - Number(item.modal);
      return {
        'No': index + 1,
        'Nama Menu': item.nama,
        'Modal Total (Rp)': Number(item.modal),
        'Harga Jual/Porsi (Rp)': Number(item.jual),
        'Jumlah Porsi': Number(item.porsi),
        'Total Omzet (Rp)': Number(item.jual) * Number(item.porsi),
        'Profit Bersih (Rp)': untungBersih,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan FoodCost");
    worksheet['!cols'] = [{wch:5}, {wch:25}, {wch:15}, {wch:20}, {wch:12}, {wch:20}, {wch:20}];
    XLSX.writeFile(workbook, "Data-FoodCost-Cuan.xlsx");
  };

  const hapusMenu = async (id) => {
    if (window.confirm("Yakin mau hapus menu ini, Chef? 🥺")) {
      try {
        await axios.delete(`http://localhost:5000/api/recipes/${id}`);
        fetchRecipes();
      } catch (err) { alert("Gagal hapus"); }
    }
  };

  const siapkanEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item._id);
    setNamaMenu(item.nama);
    setLinkFoto(item.image);
    setModal(item.modal);
    setJual(item.jual);
    setPorsi(item.porsi);
    setBahan(item.bahan);
    setLangkah(item.langkah);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const simpanAtauUpdate = async (e) => {
    e.preventDefault();
    const data = {
      nama: namaMenu,
      image: linkFoto,
      modal: Number(modal),
      jual: Number(jual),
      porsi: Number(porsi),
      bahan: bahan,
      langkah: langkah,
      createdBy: "Chef"
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/recipes/${currentId}`, data);
        alert("Menu Berhasil Diperbarui! 🔄");
      } else {
        await axios.post("http://localhost:5000/api/recipes", data);
        alert("Menu Berhasil Disimpan! ✨");
      }
      setIsEditing(false); 
      setCurrentId(null);
      setNamaMenu(""); setLinkFoto(""); setModal(""); setJual(""); setPorsi(""); setBahan(""); setLangkah("");
      fetchRecipes(); 
    } catch (err) {
      alert("Gagal proses data. Cek server backend!");
    }
  };

  const filteredRecipes = recipes.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalModal = recipes.reduce((acc, curr) => acc + Number(curr.modal), 0);
  const totalOmzet = recipes.reduce((acc, curr) => acc + (Number(curr.jual) * Number(curr.porsi)), 0);
  const totalCuan = totalOmzet - totalModal;

  const chartData = recipes.slice(0, 6).map(item => ({
    name: item.nama.substring(0, 10), 
    untung: (Number(item.jual) * Number(item.porsi)) - Number(item.modal)
  }));

  return (
    <div className={`min-h-screen font-['Quicksand'] pb-20 transition-all duration-700 relative overflow-hidden ${darkMode ? 'bg-[#0F172A]' : 'bg-[#FFF0F5]'}`}>
      
      {/* HIASAN BACKGROUND */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce select-none pointer-events-none">🧋</div>
      <div className="absolute bottom-40 right-10 text-6xl opacity-20 animate-pulse select-none pointer-events-none">🍰</div>
      <div className="absolute top-1/2 left-5 text-4xl opacity-10 animate-spin select-none pointer-events-none">✨</div>

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-[100] px-8 py-4 flex justify-between items-center backdrop-blur-md border-b transition-all ${
        darkMode ? 'bg-[#1E293B]/90 border-slate-700' : 'bg-white/80 border-pink-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-pink-500 p-2 rounded-2xl shadow-lg transform hover:rotate-12 transition-all">
            <span className="text-2xl">🍲</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-pink-600">FoodCost</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={exportToExcel} className="hidden md:block bg-green-600 px-6 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md hover:scale-105 transition-all">📊 Export Excel</button>
          <button onClick={exportToPDF} className="hidden md:block bg-emerald-500 px-6 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md hover:scale-105 transition-all">📥 Export PDF</button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-2xl shadow-inner transition-all hover:bg-pink-100 ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-500'}`}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="bg-rose-500 px-6 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md hover:bg-rose-600 transition-all">Logout</button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="mt-16 text-center px-6 relative z-10">
        <div className={`p-10 rounded-[4rem] shadow-xl inline-block border-x-8 transition-all duration-500 transform hover:scale-105 ${darkMode ? 'bg-[#1E293B] border-pink-500' : 'bg-white border-pink-200'}`}>
          <h2 className={`text-6xl font-black mb-2 tracking-tighter ${darkMode ? 'text-white' : 'text-[#1B263B]'}`}>FoodCost</h2>
          <p className="text-pink-500 font-bold italic text-lg">“Thoughtful recipes, mindful cost” 🧁🌸</p>
        </div>
      </header>

      {/* STATS CARDS */}
      <section className="max-w-6xl mx-auto mt-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className={`p-8 rounded-[3rem] shadow-lg border-b-8 border-blue-500 transition-all hover:-translate-y-2 ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <p className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">Total Modal Investasi</p>
          <h4 className="text-3xl font-black italic">Rp {totalModal.toLocaleString()}</h4>
        </div>
        <div className={`p-8 rounded-[3rem] shadow-lg border-b-8 border-emerald-500 transition-all hover:-translate-y-2 ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <p className="text-emerald-500 font-black text-xs uppercase tracking-widest mb-1">Estimasi Total Omzet</p>
          <h4 className="text-3xl font-black italic">Rp {totalOmzet.toLocaleString()}</h4>
        </div>
        <div className={`p-8 rounded-[3rem] shadow-lg border-b-8 border-pink-500 transition-all hover:-translate-y-2 ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <p className="text-pink-500 font-black text-xs uppercase tracking-widest mb-1">Total Potensi Cuan</p>
          <h4 className="text-3xl font-black italic">Rp {totalCuan.toLocaleString()} 💸</h4>
        </div>
      </section>

      {/* CHART SECTION */}
      <section className="max-w-6xl mx-auto mt-10 px-6 relative z-10">
        <div className={`p-8 rounded-[3.5rem] shadow-2xl transition-all ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <h3 className="font-black text-xl mb-6 flex items-center gap-2">📊 Perbandingan Profit Antar Menu</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} cursor={{fill: 'transparent'}} />
                <Bar dataKey="untung" radius={[10, 10, 10, 10]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EC4899' : '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <div className="max-w-xl mx-auto mt-12 px-6 relative z-10">
        <div className="relative group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Cari menu cuan kamu..." 
            className={`w-full pl-14 pr-8 py-5 rounded-[2.5rem] shadow-2xl outline-none border-2 font-bold transition-all ${
              darkMode ? 'bg-[#1E293B] border-slate-700 text-white focus:border-pink-500' : 'bg-white border-white focus:border-pink-300 text-black'
            }`}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FORM SECTION */}
      <section className="mt-12 px-6 max-w-2xl mx-auto relative z-10">
        <div className={`p-8 rounded-[3.5rem] shadow-2xl border-4 transition-all ${darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-white'}`}>
          <h3 className="text-center font-black mb-6 text-2xl flex justify-center items-center gap-2">
            <span className="text-2xl animate-bounce">{isEditing ? '📝' : '👩‍🍳'}</span> {isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}
          </h3>
          <form onSubmit={simpanAtauUpdate} className="flex flex-col gap-4">
            <input type="text" placeholder="Nama Menu" className={`w-full px-6 py-4 rounded-[2rem] outline-none font-bold ${darkMode ? 'bg-[#334155]' : 'bg-pink-50'}`} value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} required />
            <input type="text" placeholder="Link Foto 🔗" className={`w-full px-6 py-4 rounded-[2rem] outline-none font-bold ${darkMode ? 'bg-[#334155]' : 'bg-pink-50'}`} value={linkFoto} onChange={(e) => setLinkFoto(e.target.value)} required />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="Modal" className={`px-5 py-4 rounded-[2rem] outline-none font-bold text-center ${darkMode ? 'bg-[#334155]' : 'bg-blue-50'}`} value={modal} onChange={(e) => setModal(e.target.value)} required />
              <input type="number" placeholder="Harga" className={`px-5 py-4 rounded-[2rem] outline-none font-bold text-center ${darkMode ? 'bg-[#334155]' : 'bg-green-50'}`} value={jual} onChange={(e) => setJual(e.target.value)} required />
              <input type="number" placeholder="Porsi" className={`px-5 py-4 rounded-[2rem] outline-none font-bold text-center ${darkMode ? 'bg-[#334155]' : 'bg-purple-50'}`} value={porsi} onChange={(e) => setPorsi(e.target.value)} required />
            </div>
            <textarea placeholder="Bahan-bahan..." className={`w-full px-6 py-4 rounded-[2rem] h-24 ${darkMode ? 'bg-[#334155]' : 'bg-yellow-50'}`} value={bahan} onChange={(e) => setBahan(e.target.value)} />
            <textarea placeholder="Cara Membuat..." className={`w-full px-6 py-4 rounded-[2rem] h-32 ${darkMode ? 'bg-[#334155]' : 'bg-orange-50'}`} value={langkah} onChange={(e) => setLangkah(e.target.value)} />
            <button type="submit" className={`w-full py-5 rounded-[2.5rem] font-black text-white shadow-xl hover:scale-[0.98] transition-all text-lg bg-gradient-to-r ${isEditing ? 'from-orange-500 to-yellow-600' : 'from-pink-500 to-rose-600'}`}>
              {isEditing ? 'Update Menu 🔄' : 'Simpan Menu ✨'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setNamaMenu(""); setLinkFoto(""); setModal(""); setJual(""); setPorsi(""); setBahan(""); setLangkah(""); }} className="text-slate-400 font-bold hover:text-rose-500 transition-all text-sm text-center">Batal Edit</button>
            )}
          </form>
        </div>
      </section>

      {/* CARDS LIST */}
      <div id="print-area" className="mt-20 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {filteredRecipes.map((item) => {
          const untungBersih = (Number(item.jual) * Number(item.porsi)) - Number(item.modal);
          return (
            <div key={item._id} className={`rounded-[4rem] overflow-hidden shadow-2xl relative border-b-[12px] transition-all hover:-translate-y-4 group ${darkMode ? 'bg-[#1E293B] border-pink-500/50 text-white' : 'bg-white border-pink-100'}`}>
               <div className="overflow-hidden h-60 relative group">
                <img src={item.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.nama} />
                <button onClick={() => exportSingleRecipe(item)} className="absolute top-5 right-5 bg-white/90 px-4 py-2 rounded-2xl text-xs font-black text-pink-600 shadow-xl hover:bg-pink-600 hover:text-white transition-all">📄 PDF RESEP</button>
                <div className="absolute bottom-4 right-4 flex gap-2">
                   <button onClick={() => siapkanEdit(item)} className="bg-yellow-400 p-3 rounded-xl shadow-lg hover:scale-110 transition-all text-lg">✏️</button>
                   <button onClick={() => hapusMenu(item._id)} className="bg-rose-500 p-3 rounded-xl shadow-lg hover:scale-110 transition-all text-lg">🗑️</button>
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">{item.nama}</h3>
                <div className={`py-2 rounded-2xl mb-2 font-black text-[12px] border ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>MODAL: Rp {Number(item.modal).toLocaleString()}</div>
                <div className="py-4 rounded-2xl mb-5 font-black text-md bg-emerald-50 text-emerald-600 shadow-inner group-hover:bg-emerald-100">UNTUNG: +Rp {untungBersih.toLocaleString()} ✨</div>
                <button onClick={() => navigate(`/details/${item._id}`)} className="w-full py-4 bg-pink-500 text-white rounded-full font-black shadow-lg hover:bg-pink-600 transition-all">Lihat Detail 🌸</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER - WAJIB SESUAI POIN i */}
      <footer className={`mt-20 py-12 text-center border-t transition-all ${darkMode ? 'bg-[#1E293B]/50 border-slate-700 text-slate-400' : 'bg-white border-pink-100 text-pink-400'}`}>
        <p className="font-black text-lg mb-2">UAS PEMROGRAMAN WEB 1</p>
        <p className="font-bold opacity-80 italic">
          @Copyright by 23552011299_Sofia Risa Aulia_TIF 23 RP CNS A_UASWEB1
        </p>
        <div className="mt-4 flex justify-center gap-4 text-2xl animate-pulse">
          <span>🍜</span><span>🧁</span><span>🍹</span>
        </div>
      </footer>
    </div>
  );
}