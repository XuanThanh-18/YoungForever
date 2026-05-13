"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Email hoặc mật khẩu không đúng";
      setError("password", { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-500 to-pink-700 items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold font-serif mb-4">YoungForever</h1>
          <p className="text-rose-100 text-lg leading-relaxed max-w-xs">
            Vẻ đẹp tự nhiên, tỏa sáng mỗi ngày cùng mỹ phẩm cao cấp của chúng
            tôi.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link
              href="/"
              className="text-xl font-bold text-rose-600 font-serif lg:hidden block mb-6"
            >
              YoungForever
            </Link>
            <h2 className="text-2xl font-bold text-stone-800">Đăng nhập</h2>
            <p className="text-stone-500 text-sm mt-1">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-rose-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="hello@example.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300
                  ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-rose-300 bg-white"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-stone-700">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-rose-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300
                    ${errors.password ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-rose-300 bg-white"}`}
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
