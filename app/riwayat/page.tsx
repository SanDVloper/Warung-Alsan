'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

// Tipe data untuk transaksi yang diambil dari DB
type Transaction = {
  id: number
  created_at: string
  total_amount: number
  items: any[] // JSONB
}

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    // Ambil 50 transaksi terakhir
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setTransactions(data)
  }

  // Format Tanggal Indonesia
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                <ArrowLeft className="text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Riwayat Penjualan</h1>
        </div>

        <div className="space-y-4">
            {transactions.length === 0 && (
                <p className="text-center text-gray-400 py-10">Belum ada transaksi.</p>
            )}

            {transactions.map((trx) => (
                <div key={trx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2 border-b pb-2">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar size={14} />
                            {formatDate(trx.created_at)}
                        </div>
                        <span className="font-bold text-green-600 text-lg">
                            Rp {trx.total_amount.toLocaleString()}
                        </span>
                    </div>
                    
                    {/* Detail Barang (Accordion sederhana) */}
                    <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Barang dibeli:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                            {/* Parsing JSON items */}
                            {(trx.items as any[]).map((item: any, idx: number) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>Rp {(item.sell_price * item.quantity).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}