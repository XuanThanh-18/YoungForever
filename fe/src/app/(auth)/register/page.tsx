// fe/src/app/(auth)/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import axios from "axios";

const schema = z
  .object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { data: res } = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success("Đăng ký thành công! Chào mừng bạn 🎉");
      router.push("/");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Đăng ký thất bại")
        : "Đăng ký thất bại";
      toast.error(message);
    }
  };

  const fields = [
    {
      name: "fullName" as const,
      label: "Họ và tên",
      type: "text",
      placeholder: "Nguyễn Văn A",
    },
    {
      name: "email" as const,
      label: "Email",
      type: "email",
      placeholder: "your@email.com",
    },
    {
      name: "password" as const,
      label: "Mật khẩu",
      type: "password",
      placeholder: "••••••••",
    },
    {
      name: "confirmPassword" as const,
      label: "Xác nhận mật khẩu",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-rose-500">Young</span>
            <span className="text-stone-800">Forever</span>
          </h1>
          <p className="text-stone-400 text-sm mt-2">Tạo tài khoản miễn phí</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                {label}
              </label>
              <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                  errors[name] ? "border-red-300 bg-red-50" : "border-stone-200"
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[name]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Đăng ký
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-rose-600 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
