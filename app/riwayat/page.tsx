'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, ShoppingBag, Receipt } from 'lucide-react'

// --- TIPE DATA ---
type CartItem = {
  id: number
  name: string
  sell_price: number
  quantity: number
  variantName?: string // <--- INI KUNCINYA
}

type Transaction = {
  id: number
  created_at: string
  total_amount: number
  items: CartItem[] // Kolom JSONB di database
}

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false }) // Urutkan dari yang terbaru
    
    if (data) setTransactions(data)
    setLoading(false)
  }

  // Hitung Total Omzet
  const totalOmzet = transactions.reduce((sum, tx) => sum + tx.total_amount, 0)

  // Fungsi Format Tanggal (Indonesia)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                    <ArrowLeft size={20} className="text-gray-600"/>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h1>
                    <p className="text-xs text-gray-500">Daftar penjualan harian</p>
                </div>
            </div>
            
            {/* Ringkasan Omzet */}
            <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Masuk</p>
                <p className="text-lg font-bold text-green-600">Rp {totalOmzet.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        
        {loading ? (
            <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : transactions.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <Receipt size={64} className="mx-auto mb-4 text-gray-300"/>
                <p>Belum ada transaksi, Tuanku.</p>
            </div>
        ) : (
            transactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                    
                    {/* Header Kartu (Waktu & Total) */}
                    <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <Calendar size={14} />
                            {formatDate(tx.created_at)}
                        </div>
                        <span className="font-bold text-blue-600">
                            Rp {tx.total_amount.toLocaleString()}
                        </span>
                    </div>

                    {/* Daftar Item */}
                    <div className="p-4 space-y-3">
                        {tx.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div>
                                    <div className="font-medium text-gray-800 flex items-center gap-2">
                                        {item.name}
                                        
                                        {/* --- BADGE VARIAN DI SINI --- */}
                                        {item.variantName && (
                                            <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-100">
                                                {item.variantName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {item.quantity} x Rp {item.sell_price.toLocaleString()}
                                    </div>
                                </div>
                                <div className="font-bold text-gray-600">
                                    Rp {(item.quantity * item.sell_price).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            ))
        )}

      </div>
    </div>
  )
}