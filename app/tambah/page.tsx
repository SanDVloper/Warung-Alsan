'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Save, Package, Tag, DollarSign, Layers } from 'lucide-react'

export default function TambahBarang() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 1. State Data Utama
  const [form, setForm] = useState({ name: '', capital: '', sell: '', stock: '' })

  // 2. State Khusus Varian
  const [variants, setVariants] = useState<{ name: string; price: number }[]>([])
  const [variantInput, setVariantInput] = useState({ name: '', price: '' })

  // --- Fungsi-fungsi Logika ---
  const handleAddVariant = () => {
    if (!variantInput.name || !variantInput.price) {
      alert('Isi nama dan harga varian dulu, Tuanku!')
      return
    }
    setVariants([...variants, { name: variantInput.name, price: Number(variantInput.price) }])
    setVariantInput({ name: '', price: '' })
  }

  const removeVariant = (index: number) => {
    const newVariants = [...variants]
    newVariants.splice(index, 1)
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      name: form.name,
      capital_price: Number(form.capital),
      sell_price: Number(form.sell),
      stock: Number(form.stock),
      variants: variants.length > 0 ? variants : null 
    })
    
    if (!error) {
      alert('Barang berhasil disimpan!')
      setForm({ name: '', capital: '', sell: '', stock: '' }) 
      setVariants([]) 
      router.refresh()
      router.push('/')
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
    setLoading(false)
  }

  // Style input standar agar seragam (Latar Putih, Teks Hitam)
  const inputStyle = "w-full pl-10 p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex justify-center items-center">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Stok Baru</h1>
                <p className="text-sm text-gray-500">Masukkan data barang dagangan</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- INPUT UTAMA --- */}
          <div className="space-y-4">
              {/* Nama Barang */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nama Barang</label>
                <div className="relative">
                    <Package className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Contoh: Kopi Kapal Api" 
                        className={inputStyle}
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Modal */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Modal (Beli)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="number" placeholder="0" 
                            className={inputStyle}
                            value={form.capital} onChange={e => setForm({...form, capital: e.target.value})} required 
                        />
                    </div>
                </div>
                {/* Jual Dasar */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Jual (Dasar/Saset)</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="number" placeholder="0" 
                            className={inputStyle}
                            value={form.sell} onChange={e => setForm({...form, sell: e.target.value})} required 
                        />
                    </div>
                </div>
              </div>

              {/* Stok */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Stok Awal</label>
                <div className="relative">
                    <Layers className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="number" placeholder="Jumlah fisik barang" 
                        className={inputStyle}
                        value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required 
                    />
                </div>
              </div>
          </div>

          {/* --- INPUT VARIAN (PERBAIKAN WARNA DI SINI) --- */}
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 mt-6">
            <div className="flex items-center gap-2 mb-2">
                <Tag size={18} className="text-orange-600"/>
                <span className="text-base font-bold text-orange-900">Varian Tambahan (Opsional)</span>
            </div>
            
            <p className="text-sm text-orange-700 mb-4 leading-relaxed opacity-80">
                Isi ini <b>hanya jika</b> barang punya jenis olahan berbeda (Contoh: "Es", "Panas"). Klik tombol <b>+</b> untuk menambahkan.
            </p>
            
            <div className="flex gap-2 mb-3">
                {/* Input Nama Varian: Latar Putih, Teks Gelap */}
                <input 
                    type="text" placeholder="Nama (misal: Es Dingin)" 
                    className="flex-1 p-3 text-sm bg-white border border-orange-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
                    value={variantInput.name}
                    onChange={e => setVariantInput({...variantInput, name: e.target.value})}
                />
                
                {/* Input Harga Varian: Latar Putih, Teks Gelap */}
                <input 
                    type="number" placeholder="Harga Jual" 
                    className="w-28 p-3 text-sm bg-white border border-orange-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
                    value={variantInput.price}
                    onChange={e => setVariantInput({...variantInput, price: e.target.value})}
                />
                
                <button 
                    type="button" 
                    onClick={handleAddVariant} 
                    className="bg-orange-600 text-white w-12 rounded-lg hover:bg-orange-700 flex items-center justify-center shadow-sm active:scale-95 transition"
                >
                    <Plus size={24}/>
                </button>
            </div>

            {/* List Varian */}
            {variants.length > 0 ? (
                <div className="space-y-2 bg-white/60 p-2 rounded-lg border border-orange-100">
                    {variants.map((v, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                            <span className="text-gray-900 font-medium">{v.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md">Rp {v.price.toLocaleString()}</span>
                                <button type="button" onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-2 text-xs text-orange-400 font-medium italic bg-orange-100/50 rounded-lg">
                    Belum ada varian ditambahkan
                </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Menyimpan...' : (
                <>
                    <Save size={20} /> Simpan Barang
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}