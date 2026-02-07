// components/VariantModal.tsx
import React from 'react'
import { X, Coffee } from 'lucide-react'

// --- PERBAIKAN TIPE DATA (Ganti price jadi sell_price) ---
type Variant = {
  name: string
  price: number // Varian tetap 'price' karena di JSON biasanya pakai 'price'
}

type Product = {
  id: number
  name: string
  sell_price: number // <--- DULU 'price', SEKARANG 'sell_price'
  stock: number
  variants: Variant[] | null
}

interface VariantModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSelectVariant: (variant: Variant) => void
  onSelectOriginal: () => void
}

export default function VariantModal({ 
  isOpen, 
  onClose, 
  product, 
  onSelectVariant,
  onSelectOriginal 
}: VariantModalProps) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Coffee size={20} />
            Pilih Varian: {product.name}
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <p className="text-gray-500 text-sm mb-4">Pelanggan mau yang mana, Tuanku?</p>
          
          {/* Pilihan 1: Harga Normal (Saset/Mentah) */}
          <button
            onClick={onSelectOriginal}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
          >
            <div>
              <span className="font-bold text-gray-800 block">Saset / Mentah</span>
              <span className="text-xs text-gray-500">Harga standar</span>
            </div>
            {/* PERBAIKAN: Gunakan sell_price */}
            <span className="font-bold text-blue-600 text-lg">
              Rp {product.sell_price.toLocaleString()} 
            </span>
          </button>

          {/* Loop Varian dari Database */}
          {product.variants?.map((variant, index) => (
            <button
              key={index}
              onClick={() => onSelectVariant(variant)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-gray-800 block">{variant.name}</span>
                <span className="text-xs text-gray-500">Diproses/Olah</span>
              </div>
              <span className="font-bold text-orange-600 text-lg">
                Rp {variant.price.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <button onClick={onClose} className="text-gray-500 text-sm hover:text-gray-800">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}