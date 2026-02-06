'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Plus, Search, DollarSign, TrendingUp, Archive } from 'lucide-react'
import { Product } from '@/lib/store'

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus barang ini?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        fetchProducts()
      } else {
        alert('Gagal menghapus')
      }
    }
  }

  // 1. FILTER PENCARIAN
  const filteredProducts = products.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 2. HITUNG TOTAL ASET (Berdasarkan barang yang ditampilkan/difilter)
  // Rumus: Total = Jumlah Stok x Harga
  const totalModal = filteredProducts.reduce((acc, item) => acc + (item.capital_price * item.stock), 0)
  const totalJual = filteredProducts.reduce((acc, item) => acc + (item.sell_price * item.stock), 0)
  const totalLaba = totalJual - totalModal

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Navigasi */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
              <ArrowLeft className="text-gray-700" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gudang & Inventori</h1>
                <p className="text-gray-500 text-sm">Kelola stok dan harga barang</p>
            </div>
          </div>
          <Link href="/tambah" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow transition w-full md:w-auto justify-center">
            <Plus size={18} /> Tambah Barang Baru
          </Link>
        </div>

        {/* SECTION 1: RINGKASAN ASET (KARTU ATAS) */}
        {/* Info ini dinamis mengikuti hasil pencarian. Jika cari "Indomie", maka total aset Indomie saja yang muncul. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <Archive size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Aset (Modal)</p>
                    <h3 className="text-xl font-bold text-gray-800">Rp {totalModal.toLocaleString()}</h3>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Estimasi Omzet (Jual)</p>
                    <h3 className="text-xl font-bold text-gray-800">Rp {totalJual.toLocaleString()}</h3>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Potensi Laba Bersih</p>
                    <h3 className="text-xl font-bold text-gray-800">Rp {totalLaba.toLocaleString()}</h3>
                </div>
            </div>
        </div>

        {/* SECTION 2: SEARCH BAR & TABEL */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari barang di gudang..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="text-sm text-gray-500 ml-auto hidden md:block">
                Menampilkan {filteredProducts.length} barang
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-800 font-bold uppercase text-xs border-b">
                <tr>
                  <th className="p-4">Nama Barang</th>
                  <th className="p-4 text-right hidden md:table-cell">Modal Satuan</th>
                  <th className="p-4 text-right">Harga Jual</th>
                  <th className="p-4 text-right hidden md:table-cell">Laba/Unit</th>
                  <th className="p-4 text-center">Stok</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">
                        {item.name}
                        {/* Tampilan Mobile: Detail Harga muncul di bawah nama */}
                        <div className="md:hidden text-xs text-gray-400 mt-1">
                            Modal: Rp {item.capital_price.toLocaleString()}
                        </div>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">Rp {item.capital_price.toLocaleString()}</td>
                    <td className="p-4 text-right">Rp {item.sell_price.toLocaleString()}</td>
                    <td className="p-4 text-right hidden md:table-cell text-green-600 font-bold">
                      Rp {(item.sell_price - item.capital_price).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.stock}
                        </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <Link href={`/inventory/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && !loading && (
                <div className="text-center p-10 text-gray-400">
                    Barang tidak ditemukan.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}