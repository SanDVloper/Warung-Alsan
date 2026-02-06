'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TambahBarang() {
  const [form, setForm] = useState({ name: '', capital: '', sell: '', stock: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('products').insert({
      name: form.name,
      capital_price: Number(form.capital),
      sell_price: Number(form.sell),
      stock: Number(form.stock),
    })
    
    if (!error) {
      alert('Barang berhasil ditambahkan!')
      setForm({ name: '', capital: '', sell: '', stock: '' }) // Reset form
    } else {
      alert('Gagal menambah barang')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah Stok Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Nama Barang" className="w-full p-3 border rounded text-black"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" placeholder="Harga Modal" className="w-full p-3 border rounded text-black"
              value={form.capital} onChange={e => setForm({...form, capital: e.target.value})} required 
            />
            <input 
              type="number" placeholder="Harga Jual" className="w-full p-3 border rounded text-black"
              value={form.sell} onChange={e => setForm({...form, sell: e.target.value})} required 
            />
          </div>
          <input 
            type="number" placeholder="Stok Awal" className="w-full p-3 border rounded text-black"
            value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required 
          />
          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">
            Simpan Barang
          </button>
        </form>
        <Link href="/" className="block text-center mt-4 text-blue-500 hover:underline">
          Kembali ke Kasir
        </Link>
      </div>
    </div>
  )
}