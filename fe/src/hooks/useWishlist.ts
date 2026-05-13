import { useState, useEffect } from "react";
import { wishlistApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function useWishlist(productId: string) {
  const { isAuthenticated } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !productId) return;
    wishlistApi
      .check(productId)
      .then(({ data }) => setIsWishlisted(data.data))
      .catch(() => {});
  }, [productId, isAuthenticated]);

  const toggle = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      return;
    }
    setIsLoading(true);
    try {
      await wishlistApi.toggle(productId);
      setIsWishlisted((prev) => !prev);
      toast.success(
        isWishlisted ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
      );
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return { isWishlisted, isLoading, toggle };
}
