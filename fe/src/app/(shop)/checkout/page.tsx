"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin, CreditCard, Tag, ChevronRight } from "lucide-react";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderApi, paymentApi, userApi, couponApi } from "@/lib/api";
import { formatVnd, PAYMENT_METHOD_LABEL } from "@/lib/utils";
import type { AddressResponse, CouponResponse } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  addressId: z.string().min(1, "Vui lòng chọn địa chỉ giao hàng"),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO"]),
  couponCode: z.string().optional(),
  customerNote: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "COD" },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchCart();
    userApi.getAddresses().then(({ data }) => setAddresses(data.data));
  }, [isAuthenticated]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400">
        <p>Giỏ hàng của bạn đang trống.</p>
      </div>
    );
  }

  const subtotal = cart.totalPrice;
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = coupon?.calculatedDiscount ?? 0;
  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await couponApi.apply(couponInput, subtotal);
      setCoupon(data.data);
      toast.success(
        `Áp dụng mã giảm giá thành công! Tiết kiệm ${formatVnd(data.data.calculatedDiscount)}`,
      );
    } catch (error: unknown) {
      let message = "Mã giảm giá không hợp lệ";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Đặt hàng
      const { data: orderData } = await orderApi.place({
        addressId: formData.addressId,
        paymentMethod: formData.paymentMethod,
        couponCode: coupon?.code,
        customerNote: formData.customerNote,
      });
      const order = orderData.data;

      // 2. Nếu thanh toán online → tạo URL và redirect
      if (formData.paymentMethod === "VNPAY") {
        const { data: payData } = await paymentApi.createVnpay(order.id);
        window.location.href = payData.data.paymentUrl;
        return;
      }
      if (formData.paymentMethod === "MOMO") {
        const { data: payData } = await paymentApi.createMomo(order.id);
        window.location.href = payData.data.paymentUrl;
        return;
      }

      // 3. COD → trang cảm ơn
      toast.success("Đặt hàng thành công!");
      router.push(`/orders/${order.id}?success=1`);
    } catch (error: unknown) {
      let message = "Có lỗi xảy ra khi đặt hàng";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800 font-serif mb-8">
        Thanh toán
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Địa chỉ */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-stone-800 mb-4">
                <MapPin size={18} className="text-rose-500" /> Địa chỉ giao hàng
              </h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Bạn chưa có địa chỉ nào.{" "}
                  <a href="/profile" className="text-rose-600 underline">
                    Thêm địa chỉ
                  </a>
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50 transition-colors"
                    >
                      <input
                        type="radio"
                        value={addr.id}
                        {...register("addressId")}
                        defaultChecked={addr.isDefault}
                        className="mt-1 accent-rose-600"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-stone-800">
                          {addr.fullName} · {addr.phone}
                          {addr.isDefault && (
                            <span className="ml-2 text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
                              Mặc định
                            </span>
                          )}
                        </p>
                        <p className="text-stone-500 mt-0.5">
                          {[addr.street, addr.ward, addr.district, addr.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.addressId && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.addressId.message}
                </p>
              )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-stone-800 mb-4">
                <CreditCard size={18} className="text-rose-500" /> Phương thức
                thanh toán
              </h2>
              <div className="space-y-3">
                {(["COD", "VNPAY", "MOMO"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 cursor-pointer has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50 transition-colors"
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register("paymentMethod")}
                      className="accent-rose-600"
                    />
                    <span className="text-sm text-stone-700 font-medium">
                      {PAYMENT_METHOD_LABEL[method]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Ghi chú đơn hàng (không bắt buộc)
              </label>
              <textarea
                {...register("customerNote")}
                rows={3}
                placeholder="Ghi chú cho người giao hàng..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-stone-800 mb-3 text-sm">
                <Tag size={16} className="text-rose-500" /> Mã giảm giá
              </h3>
              {coupon ? (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-rose-700">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-rose-500">
                      -{formatVnd(coupon.calculatedDiscount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-xs text-stone-400 hover:text-red-500"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 disabled:opacity-60 flex items-center gap-1"
                  >
                    {applyingCoupon ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Áp dụng"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
              <h3 className="font-semibold text-stone-800">Tóm tắt đơn hàng</h3>

              {/* Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-stone-600"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="flex-1 line-clamp-1">
                      {item.productName} ×{item.quantity}
                    </span>
                    <span className="font-medium text-stone-700">
                      {formatVnd(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-stone-100" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span>{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatVnd(shipping)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Giảm giá</span>
                    <span>-{formatVnd(discount)}</span>
                  </div>
                )}
              </div>

              <hr className="border-stone-100" />

              <div className="flex justify-between font-bold text-stone-800">
                <span>Tổng cộng</span>
                <span className="text-rose-600 text-lg">
                  {formatVnd(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    {paymentMethod === "COD" ? "Đặt hàng" : "Thanh toán"}{" "}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
