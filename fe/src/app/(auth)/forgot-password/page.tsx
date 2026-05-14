"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch {
      // Luôn show success để tránh lộ email đã đăng ký
      setSentEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-500 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="text-white text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif mb-3">
            Đặt lại mật khẩu
          </h1>
          <p className="text-rose-100 text-base leading-relaxed max-w-xs">
            Đừng lo! Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu đến email của
            bạn.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            Quay lại đăng nhập
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail size={22} className="text-rose-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">
                  Quên mật khẩu?
                </h2>
                <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                  Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu
                  cho bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Địa chỉ email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="hello@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300
                        ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200 bg-white"}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {isSubmitting ? "Đang gửi..." : "Gửi link đặt lại"}
                </button>
              </form>

              <p className="text-center text-sm text-stone-400 mt-6">
                Nhớ mật khẩu rồi?{" "}
                <Link
                  href="/login"
                  className="text-rose-600 hover:underline font-medium"
                >
                  Đăng nhập
                </Link>
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                Kiểm tra email!
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-2">
                Chúng tôi đã gửi link đặt lại mật khẩu đến:
              </p>
              <p className="font-semibold text-rose-600 mb-6">{sentEmail}</p>
              <p className="text-xs text-stone-400 mb-8 leading-relaxed">
                Không thấy email? Kiểm tra thư mục spam hoặc{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-rose-600 hover:underline font-medium"
                >
                  gửi lại
                </button>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <ArrowLeft size={15} />
                Về trang đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
