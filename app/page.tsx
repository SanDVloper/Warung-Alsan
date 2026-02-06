'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore, Product } from '@/lib/store'
import { Trash2, Search, ShoppingCart, X, History, Plus, Package, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function WarungKasir() {
  const [products, setProducts] = useState<Product[]>([])
  const { cart, addToCart, removeFromCart, clearCart, totalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  
  // State Search & Mobile Cart
  const [searchTerm, setSearchTerm] = useState('') 
  const [showMobileCart, setShowMobileCart] = useState(false)

  // FITUR BARU: Uang Pembayaran
  const [payment, setPayment] = useState<number | ''>('') 

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProducts(data)
  }

  // Hitung Kembalian
  const total = totalPrice()
  const kembalian = payment ? (Number(payment) - total) : 0
  const isPaymentSufficient = payment ? Number(payment) >= total : false

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    // Validasi Pembayaran (Opsional: bisa dihapus jika boleh hutang/kurang)
    if (!isPaymentSufficient) {
        alert('Uang pembayaran kurang!')
        return
    }

    setLoading(true)
    
    const { error } = await supabase.from('transactions').insert({
      total_amount: total,
      items: cart
    })

    if (!error) {
      for (const item of cart) {
         const newStock = item.stock - item.quantity
         await supabase.from('products').update({ stock: newStock }).eq('id', item.id)
      }
      
      // Tampilkan info kembalian di alert akhir
      alert(`Transaksi Sukses!\n\nTotal: Rp ${total.toLocaleString()}\nBayar: Rp ${Number(payment).toLocaleString()}\nKembalian: Rp ${kembalian.toLocaleString()}`)
      
      clearCart()
      setPayment('') // Reset kolom uang
      fetchProducts()
      setShowMobileCart(false) 
    } else {
      alert('Gagal menyimpan transaksi')
    }
    setLoading(false)
  }

  // Format Rupiah untuk Input
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPayment(value === '' ? '' : Number(value))
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* BAGIAN KIRI: DAFTAR PRODUK */}
      <div className={`flex-1 flex flex-col h-full ${showMobileCart ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header & Search */}
        <div className="p-4 bg-white shadow-sm z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Warung Alsan 🏪</h1>
            <div className="flex gap-2">
                <Link href="/dashboard" className="p-2 bg-purple-100 rounded-full hover:bg-purple-200" title="Dashboard Keuangan">
                    <LayoutDashboard size={20} className="text-purple-600"/>
                </Link>
                <Link href="/inventory" className="p-2 bg-orange-100 rounded-full hover:bg-orange-200" title="Gudang">
                    <Package size={20} className="text-orange-600"/>
                </Link>
                <Link href="/riwayat" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" title="Riwayat">
                    <History size={20} className="text-gray-600"/>
                </Link>
                <Link href="/tambah" className="p-2 bg-blue-100 rounded-full hover:bg-blue-200" title="Tambah Barang">
                    <Plus size={20} className="text-blue-600"/>
                </Link>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari barang..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Barang */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition text-left flex flex-col justify-between h-28 md:h-32 border border-gray-100"
              >
                <span className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight">
                  {product.name}
                </span>
                <div className="mt-2">
                  <div className="text-blue-600 font-bold text-sm md:text-base">
                    Rp {product.sell_price.toLocaleString()}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400">
                    Stok: {product.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOMBOL MELAYANG (MOBILE) */}
      {!showMobileCart && cart.length > 0 && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <button 
                onClick={() => setShowMobileCart(true)}
                className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-short"
            >
                <div className="flex items-center gap-2">
                    <div className="bg-blue-800 p-1 rounded text-xs font-bold w-6 h-6 flex items-center justify-center">
                        {cart.length}
                    </div>
                    <span className="font-semibold">Lihat Keranjang</span>
                </div>
                <span className="font-bold text-lg">Rp {total.toLocaleString()}</span>
            </button>
        </div>
      )}

      {/* BAGIAN KANAN: KERANJANG & KALKULATOR */}
      <div className={`
        fixed inset-0 z-40 bg-white md:static md:w-96 md:shadow-xl md:flex flex-col transition-transform duration-300
        ${showMobileCart ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        {/* Header Mobile */}
        <div className="p-4 border-b flex justify-between items-center md:hidden bg-gray-50">
            <h2 className="font-bold text-lg text-gray-800">Detail Pesanan</h2>
            <button onClick={() => setShowMobileCart(false)} className="p-2 bg-gray-200 rounded-full">
                <X size={20} className="text-gray-600"/>
            </button>
        </div>

        {/* Header Desktop */}
        <div className="hidden md:flex items-center gap-2 p-6 border-b bg-gray-50">
          <ShoppingCart className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Keranjang</h2>
        </div>

        {/* List Item */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center mt-10 opacity-50">
                <ShoppingCart size={48} className="mx-auto mb-2"/>
                <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white border p-3 rounded-lg shadow-sm">
                <div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.quantity} x Rp {item.sell_price.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">
                    Rp {(item.quantity * item.sell_price).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AREA CHECKOUT & HITUNG KEMBALIAN */}
        <div className="p-6 border-t bg-gray-50 space-y-4">
            
            {/* Total Tagihan */}
            <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Tagihan</span>
                <span className="text-2xl font-bold text-blue-600">
                Rp {total.toLocaleString()}
                </span>
            </div>

            {/* Input Uang Pembeli */}
            <div className="bg-white p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-400 mb-1">UANG DITERIMA</label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">Rp</span>
                    <input 
                        type="number" 
                        placeholder="0"
                        className="w-full text-xl font-bold text-gray-800 focus:outline-none"
                        value={payment}
                        onChange={handlePaymentChange}
                    />
                </div>
            </div>

            {/* Display Kembalian */}
            <div className={`flex justify-between items-center p-3 rounded-xl ${isPaymentSufficient ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}`}>
                <span className="text-sm font-bold">Kembalian</span>
                <span className="text-xl font-bold">
                    Rp {kembalian.toLocaleString()}
                </span>
            </div>
          
            <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading || !isPaymentSufficient}
                className={`w-full py-3 rounded-xl text-white font-bold text-lg transition shadow-lg
                ${(cart.length === 0 || !isPaymentSufficient) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                `}
            >
                {loading ? 'Proses...' : `Bayar (Rp ${total.toLocaleString()})`}
            </button>
        </div>
      </div>

    </div>
  )
}