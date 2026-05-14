"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import axios from "axios";

const schema = z
  .object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
    agree: z.boolean().refine((v) => v === true, "Vui lòng đồng ý điều khoản"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  });

  const password = watch("password", "");

  // Password strength
  const checks = [
    { ok: password.length >= 8, text: "Ít nhất 8 ký tự" },
    { ok: /[A-Z]/.test(password), text: "Ít nhất 1 chữ hoa" },
    { ok: /[0-9]/.test(password), text: "Ít nhất 1 chữ số" },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const strengthMeta = [
    null,
    { label: "Yếu", bar: "bg-red-400" },
    { label: "Trung bình", bar: "bg-amber-400" },
    { label: "Mạnh", bar: "bg-emerald-500" },
  ][strength];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.fullName);
    } catch (err: unknown) {
      let msg = "Đăng ký thất bại. Vui lòng thử lại.";
      if (axios.isAxiosError(err)) {
        msg = err?.response?.data?.message ?? msg;
      }
      setError("email", { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-rose-500 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="text-white text-center relative z-10 max-w-xs">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4">YoungForever</h1>
          <p className="text-rose-100 text-base leading-relaxed">
            Tham gia cộng đồng hàng nghìn khách hàng yêu mỹ phẩm cao cấp của
            chúng tôi.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Ưu đãi thành viên độc quyền",
              "Tích điểm đổi quà hấp dẫn",
              "Theo dõi đơn hàng realtime",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-rose-100"
              >
                <CheckCircle size={14} className="text-white flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-sm py-4">
          <div className="mb-7">
            <Link
              href="/"
              className="text-xl font-bold text-rose-600 font-serif lg:hidden block mb-5"
            >
              YoungForever
            </Link>
            <h2 className="text-2xl font-bold text-stone-800">Tạo tài khoản</h2>
            <p className="text-stone-500 text-sm mt-1">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-rose-600 hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Họ và tên
              </label>
              <input
                {...register("fullName")}
                placeholder="Nguyễn Thị Lan"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
                  errors.fullName
                    ? "border-red-300 bg-red-50"
                    : "border-stone-200 bg-white",
                )}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="hello@example.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
                  errors.email
                    ? "border-red-300 bg-red-50"
                    : "border-stone-200 bg-white",
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
                  className={cn(
                    "w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-stone-200 bg-white",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}

              {/* Strength + checklist */}
              {password && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i <= strength
                            ? (strengthMeta?.bar ?? "bg-stone-200")
                            : "bg-stone-200",
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {checks.map(({ ok, text }) => (
                      <div
                        key={text}
                        className={cn(
                          "flex items-center gap-1.5 text-xs transition-colors",
                          ok ? "text-emerald-600" : "text-stone-400",
                        )}
                      >
                        <CheckCircle
                          size={11}
                          className={ok ? "text-emerald-500" : "text-stone-300"}
                        />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showCon ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className={cn(
                    "w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-stone-200 bg-white",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCon(!showCon)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCon ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                {...register("agree")}
                type="checkbox"
                className="accent-rose-600 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <span className="text-xs text-stone-500 leading-relaxed">
                Tôi đồng ý với{" "}
                <Link
                  href="/terms"
                  className="text-rose-600 hover:underline font-medium"
                >
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link
                  href="/privacy"
                  className="text-rose-600 hover:underline font-medium"
                >
                  Chính sách bảo mật
                </Link>{" "}
                của YoungForever
              </span>
            </label>
            {errors.agree && (
              <p className="text-red-500 text-xs -mt-2">
                {errors.agree.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang tạo tài
                  khoản...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Tạo tài khoản
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-6">
            Bằng cách đăng ký, bạn xác nhận đã đủ 18 tuổi.
          </p>
        </div>
      </div>
    </div>
  );
}
