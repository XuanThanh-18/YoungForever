import { create } from "zustand";
import type { CartResponse, CartItemResponse } from "@/types";
import { cartApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  isOpen: boolean; // drawer mở/đóng

  fetchCart: () => Promise<void>;
  addItem: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const { data } = await cartApi.get();
      set({ cart: data.data });
    } catch {
      // Giỏ hàng trống hoặc chưa đăng nhập – ignore
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, variantId) => {
    try {
      set({ isLoading: true });
      const { data } = await cartApi.addItem(productId, quantity, variantId);
      set({ cart: data.data, isOpen: true });
      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm sản phẩm");
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await cartApi.updateItem(itemId, quantity);
      set({ cart: data.data });
    } catch {
      toast.error("Không thể cập nhật số lượng");
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartApi.removeItem(itemId);
      await get().fetchCart();
      toast.success("Đã xóa sản phẩm");
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ cart: null });
    } catch {
      toast.error("Không thể xóa giỏ hàng");
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  totalItems: () => get().cart?.totalItems ?? 0,
  totalPrice: () => get().cart?.totalPrice ?? 0,
}));
