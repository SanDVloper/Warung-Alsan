'use client'
import { useEffect, useState, use } from 'react' // Tambah import 'use'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

// Perhatikan tipe data params diubah menjadi Promise
export default function EditBarang({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // UNWRAP PARAMS: Kita buka promise-nya di sini menggunakan hook 'use'
  const { id } = use(params)

  const [form, setForm] = useState({ name: '', capital_price: 0, sell_price: 0, stock: 0 })
  const [loading, setLoading] = useState(true)

  // 1. Ambil data barang lama berdasarkan ID yang sudah di-unwrap
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setForm(data)
        setLoading(false)
      } else {
        console.error("Error fetching:", error)
      }
    }
    fetchData()
  }, [id]) // Dependency ganti ke 'id'

  // 2. Simpan Perubahan
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        capital_price: form.capital_price,
        sell_price: form.sell_price,
        stock: form.stock
      })
      .eq('id', id)

    if (!error) {
      alert('Data berhasil diupdate!')
      router.push('/inventory')
      router.refresh()
    } else {
      alert('Gagal update data')
    }
  }

  if (loading) return <div className="p-10 text-center">Loading data...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        
        <div className="flex items-center gap-3 mb-6">
            <Link href="/inventory" className="text-gray-500 hover:text-gray-800">
                <ArrowLeft />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Barang</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Modal</label>
                <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={form.capital_price} 
                onChange={e => setForm({...form, capital_price: Number(e.target.value)})} 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input 
                type="number" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={form.sell_price} 
                onChange={e => setForm({...form, sell_price: Number(e.target.value)})} 
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Tersedia</label>
            <input 
              type="number" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={form.stock} 
              onChange={e => setForm({...form, stock: Number(e.target.value)})} 
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex justify-between">
            <span>Keuntungan per unit:</span>
            <span className="font-bold">Rp {(form.sell_price - form.capital_price).toLocaleString()}</span>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
            <Save size={18}/> Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  )
}