'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Tag } from 'lucide-react'

export default function EditBarang() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', capital_price: 0, sell_price: 0, stock: 0 })
  const [variants, setVariants] = useState<{ name: string; price: number }[]>([])
  const [variantInput, setVariantInput] = useState({ name: '', price: '' })

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setForm({
            name: data.name,
            capital_price: data.capital_price,
            sell_price: data.sell_price,
            stock: data.stock
        })
        if (data.variants && Array.isArray(data.variants)) {
            setVariants(data.variants)
        }
        setLoading(false)
      } else {
        console.error("Error fetching:", error)
        alert("Gagal mengambil data barang.")
        router.push('/inventory')
      }
    }
    fetchData()
  }, [id, router])

  const handleAddVariant = () => {
    if (!variantInput.name || !variantInput.price) {
      alert('Isi nama dan harga varian dulu!')
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        capital_price: form.capital_price,
        sell_price: form.sell_price,
        stock: form.stock,
        variants: variants.length > 0 ? variants : null 
      })
      .eq('id', id)

    if (!error) {
      alert('Data berhasil diupdate!')
      router.push('/inventory')
      router.refresh()
    } else {
      alert('Gagal update data: ' + error.message)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-gray-600 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            Memuat data barang...
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex justify-center items-center">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-lg">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Link href="/inventory" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Barang</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Barang</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-none transition"
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Harga Modal */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga Modal</label>
                <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-none transition"
                value={form.capital_price} 
                onChange={e => setForm({...form, capital_price: Number(e.target.value)})} 
                />
            </div>
            {/* Harga Jual */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga Jual (Dasar)</label>
                <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-none transition"
                value={form.sell_price} 
                onChange={e => setForm({...form, sell_price: Number(e.target.value)})} 
                />
            </div>
          </div>

          {/* Stok */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stok Fisik</label>
            <input 
              type="number" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-none transition"
              value={form.stock} 
              onChange={e => setForm({...form, stock: Number(e.target.value)})} 
            />
          </div>

          {/* --- BAGIAN VARIAN (RESPONSIF MOBILE) --- */}
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 mt-4">
            <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-orange-600"/>
                <span className="text-sm font-bold text-orange-800">Varian Tambahan (Opsional)</span>
            </div>
            
            <p className="text-xs text-orange-600 mb-3 opacity-80">
                Gunakan ini jika barang memiliki jenis olahan (Contoh: "Es", "Panas").
            </p>
            
            {/* WRAPPER FLEX: Kolom di Mobile, Baris di Desktop */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
                {/* 1. Input Nama (Full Width) */}
                <input 
                    type="text" placeholder="Nama Varian" 
                    className="w-full md:flex-1 p-3 text-sm bg-white border border-orange-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
                    value={variantInput.name}
                    onChange={e => setVariantInput({...variantInput, name: e.target.value})}
                />
                
                {/* 2. Container Harga & Tombol (Lebar Penuh di Mobile) */}
                <div className="flex gap-3 w-full md:w-auto">
                    <input 
                        type="number" placeholder="Harga" 
                        // Tambah 'min-w-0' dan 'w-full' agar tidak overflow
                        className="flex-1 w-full md:w-32 p-3 text-sm bg-white border border-orange-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm min-w-0"
                        value={variantInput.price}
                        onChange={e => setVariantInput({...variantInput, price: e.target.value})}
                    />
                    <button 
                        type="button" 
                        onClick={handleAddVariant} 
                        // Tambah 'flex-none' agar tombol tetap kotak
                        className="bg-orange-600 text-white w-12 flex-none rounded-lg hover:bg-orange-700 flex items-center justify-center shadow-sm active:scale-95 transition"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
            </div>

            {/* List Varian */}
            {variants.length > 0 ? (
                <div className="space-y-2 bg-white/60 p-2 rounded-lg border border-orange-100">
                    {variants.map((v, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                            <span className="text-gray-800 font-medium">{v.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs">Rp {v.price.toLocaleString()}</span>
                                <button type="button" onClick={() => removeVariant(i)} className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-2 text-xs text-orange-400 italic">
                    Tidak ada varian (Barang standar)
                </div>
            )}
          </div>

          {/* Info Keuntungan */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex justify-between border border-blue-100">
            <span>Estimasi Laba per unit:</span>
            <span className="font-bold">Rp {(form.sell_price - form.capital_price).toLocaleString()}</span>
          </div>

          {/* Tombol Simpan */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 transition shadow-lg disabled:opacity-70 active:scale-95"
          >
            {saving ? 'Menyimpan...' : (
                <>
                    <Save size={18}/> Simpan Perubahan
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}