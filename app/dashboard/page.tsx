'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, AlertTriangle, Package } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    omzetHariIni: 0,
    profitHariIni: 0,
    transaksiHariIni: 0,
    lowStockCount: 0
  })
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = async () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) 
    const startOfDay = now.toISOString() 

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startOfDay) 

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .lt('stock', 5)
      .order('stock')

    let totalOmzet = 0
    let totalProfit = 0

    if (transactions) {
      transactions.forEach((trx) => {
        totalOmzet += trx.total_amount
        
        if (trx.items) {
           const items: any[] = trx.items
           items.forEach((item) => {
             const hargaJual = item.sell_price || 0
             const hargaModal = item.capital_price || 0
             const qty = item.quantity || 0
             
             const profitPerItem = (hargaJual - hargaModal) * qty
             totalProfit += profitPerItem
           })
        }
      })
    }

    setStats({
      omzetHariIni: totalOmzet,
      profitHariIni: totalProfit,
      transaksiHariIni: transactions?.length || 0,
      lowStockCount: products?.length || 0
    })

    if (products) setLowStockItems(products)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                <ArrowLeft className="text-gray-700" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Warung</h1>
                <p className="text-gray-500 text-sm">Laporan hari ini, {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-10">Menghitung duit...</div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <DollarSign className="absolute right-4 top-4 opacity-20" size={48} />
                        <p className="text-blue-100 font-medium mb-1">Omzet Hari Ini</p>
                        <h3 className="text-3xl font-bold">Rp {stats.omzetHariIni.toLocaleString()}</h3>
                        <div className="mt-4 text-xs bg-blue-700 inline-block px-2 py-1 rounded">
                            {stats.transaksiHariIni} Transaksi
                        </div>
                    </div>

                    <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <TrendingUp className="absolute right-4 top-4 opacity-20" size={48} />
                        <p className="text-green-100 font-medium mb-1">Keuntungan Bersih</p>
                        <h3 className="text-3xl font-bold">Rp {stats.profitHariIni.toLocaleString()}</h3>
                        <p className="text-xs text-green-200 mt-4">Uang yang boleh dipakai jajan</p>
                    </div>

                    <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <AlertTriangle className="absolute right-4 top-4 opacity-20" size={48} />
                        <p className="text-orange-100 font-medium mb-1">Perlu Restock</p>
                        <h3 className="text-3xl font-bold">{stats.lowStockCount} Barang</h3>
                        <p className="text-xs text-orange-200 mt-4">Stok kurang dari 5</p>
                    </div>
                </div>

                {lowStockItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-red-50 flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={20}/>
                            <h3 className="font-bold text-red-700">Barang Segera Habis</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-4">Nama Barang</th>
                                    <th className="p-4 text-center">Sisa Stok</th>
                                    <th className="p-4 text-right">Modal</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lowStockItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-500">
                                            Rp {item.capital_price.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link href={`/inventory/edit/${item.id}`} className="text-blue-600 hover:underline">
                                                Restock
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {lowStockItems.length === 0 && (
                    <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500 flex flex-col items-center">
                        <Package size={48} className="mb-2 text-green-500" />
                        <p>Stok aman semua, Warung Alsan! Siap jualan.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  )
}