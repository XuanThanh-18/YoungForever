"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";
import { paymentApi } from "@/lib/api";
import { formatVnd, PAYMENT_METHOD_LABEL } from "@/lib/utils";
import type { PaymentResponse } from "@/types";

export default function CheckoutResultPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId"); // lấy từ redirect URL mà FE tự đính vào
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Poll trạng thái thanh toán
    const check = async () => {
      try {
        const { data } = await paymentApi.getStatus(orderId);
        setPayment(data.data);
      } catch {
        setError("Không thể kiểm tra trạng thái thanh toán");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 font-serif mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-stone-500 text-sm mb-6">
            Không tìm thấy thông tin đơn hàng
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors text-sm"
            >
              Quay lại
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={40} className="animate-spin text-rose-500 mx-auto" />
          <p className="text-stone-500 text-sm">
            Đang kiểm tra trạng thái thanh toán...
          </p>
        </div>
      </div>
    );
  }

  const isPaid = payment?.status === "PAID";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {isPaid ? (
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
        )}

        <h1 className="text-2xl font-bold text-stone-800 font-serif mb-2">
          {isPaid ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          {isPaid
            ? "Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ sớm nhất."
            : (error ??
              "Giao dịch của bạn không thành công. Vui lòng thử lại.")}
        </p>

        {payment && (
          <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Mã đơn hàng</span>
              <span className="font-semibold text-stone-800">
                {payment.orderNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Phương thức</span>
              <span className="font-medium text-stone-700">
                {PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Số tiền</span>
              <span className="font-bold text-rose-600">
                {formatVnd(payment.amount)}
              </span>
            </div>
            {payment.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Mã giao dịch</span>
                <span className="font-mono text-xs text-stone-600">
                  {payment.transactionId}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isPaid ? (
            <>
              <Link
                href={`/orders/${payment?.orderId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors text-sm"
              >
                <ShoppingBag size={16} /> Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
              >
                Tiếp tục mua sắm
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors text-sm"
              >
                Thử lại
              </button>
              <Link
                href="/orders"
                className="px-6 py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
              >
                Xem đơn hàng
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
