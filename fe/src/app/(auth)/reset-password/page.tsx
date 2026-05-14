"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newPass = watch("newPassword", "");

  const strength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength(newPass);
  const strengthMeta = [
    null,
    { label: "Yếu", color: "bg-red-400", text: "text-red-500" },
    { label: "Trung bình", color: "bg-amber-400", text: "text-amber-500" },
    { label: "Khá tốt", color: "bg-blue-400", text: "text-blue-500" },
    { label: "Mạnh", color: "bg-emerald-500", text: "text-emerald-600" },
  ][s];

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            Link không hợp lệ
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Link đặt lại mật khẩu không đúng hoặc đã hết hạn. Vui lòng yêu cầu
            link mới.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Yêu cầu link mới
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      // Token hết hạn
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-500 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="text-white text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif mb-3">Mật khẩu mới</h1>
          <p className="text-rose-100 text-base leading-relaxed max-w-xs">
            Tạo mật khẩu mạnh để bảo vệ tài khoản YoungForever của bạn.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-sm">
          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={22} className="text-rose-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  Tạo mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      {...register("newPassword")}
                      type={showNew ? "text" : "password"}
                      placeholder="Tối thiểu 8 ký tự"
                      className={cn(
                        "w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
                        errors.newPassword
                          ? "border-red-300 bg-red-50"
                          : "border-stone-200 bg-white",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}

                  {/* Strength meter */}
                  {newPass && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all",
                              i <= s
                                ? (strengthMeta?.color ?? "bg-stone-200")
                                : "bg-stone-200",
                            )}
                          />
                        ))}
                      </div>
                      {strengthMeta && (
                        <p
                          className={cn(
                            "text-xs font-medium",
                            strengthMeta.text,
                          )}
                        >
                          Độ mạnh: {strengthMeta.label}
                        </p>
                      )}
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

                {/* Requirements */}
                <div className="bg-stone-50 rounded-xl p-3 space-y-1.5">
                  {[
                    { ok: newPass.length >= 8, text: "Ít nhất 8 ký tự" },
                    { ok: /[A-Z]/.test(newPass), text: "Ít nhất 1 chữ hoa" },
                    { ok: /[0-9]/.test(newPass), text: "Ít nhất 1 chữ số" },
                  ].map(({ ok, text }) => (
                    <div
                      key={text}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        ok ? "text-emerald-600" : "text-stone-400",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all",
                          ok
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-stone-300",
                        )}
                      >
                        {ok && <CheckCircle size={10} className="text-white" />}
                      </div>
                      {text}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Đặt mật khẩu mới"}
                </button>
              </form>
            </>
          ) : (
            /* Success */
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                Thành công!
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-2">
                Mật khẩu của bạn đã được cập nhật.
              </p>
              <p className="text-xs text-stone-400 mb-8">
                Đang chuyển về trang đăng nhập...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <ArrowLeft size={15} />
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
