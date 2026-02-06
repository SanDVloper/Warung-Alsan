import { create } from 'zustand'

// Tipe Data
export type Product = {
  id: number
  name: string
  capital_price: number
  sell_price: number
  stock: number
}

export type CartItem = Product & { quantity: number }

interface CartState {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id)
    if (existing) {
      // Jika barang sudah ada, tambah quantity
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }
    }
    // Jika barang baru, masukkan ke keranjang
    return { cart: [...state.cart, { ...product, quantity: 1 }] }
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id)
  })),

  clearCart: () => set({ cart: [] }),

  totalPrice: () => {
    return get().cart.reduce((acc, item) => acc + (item.sell_price * item.quantity), 0)
  }
}))