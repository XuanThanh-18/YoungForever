"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Lock,
  MapPin,
  Camera,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Home,
  Briefcase,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AddressResponse } from "@/types";
import toast from "react-hot-toast";

// ─── Schemas ──────────────────────────────────────────────────
const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const addressSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  city: z.string().min(1, "Chọn tỉnh/thành"),
  district: z.string().min(1, "Nhập quận/huyện"),
  ward: z.string().optional(),
  street: z.string().min(5, "Nhập địa chỉ cụ thể"),
  isDefault: z.boolean().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type AddressForm = z.infer<typeof addressSchema>;

const TABS = [
  { key: "info", label: "Thông tin cá nhân", icon: User },
  { key: "password", label: "Đổi mật khẩu", icon: Lock },
  { key: "address", label: "Địa chỉ giao hàng", icon: MapPin },
] as const;
type Tab = (typeof TABS)[number]["key"];

// ─── Profile Tab ──────────────────────────────────────────────
function ProfileTab() {
  const { user, setAuth } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const { data: res } = await userApi.updateProfile(data);
      const token = useAuthStore.getState().accessToken ?? "";
      const refresh = useAuthStore.getState().refreshToken ?? "";
      setAuth(res.data, token, refresh);
      toast.success("Cập nhật thông tin thành công!");
    } catch {
      toast.error("Cập nhật thất bại, thử lại sau");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    setUploading(true);
    try {
      const { data: res } = await userApi.uploadAvatar(file);
      const token = useAuthStore.getState().accessToken ?? "";
      const refresh = useAuthStore.getState().refreshToken ?? "";
      setAuth({ ...user!, avatarUrl: res.data }, token, refresh);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center border-2 border-rose-200">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-rose-500">
                {initials}
              </span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-700 transition-colors shadow-sm">
            {uploading ? (
              <Loader2 size={12} className="text-white animate-spin" />
            ) : (
              <Camera size={12} className="text-white" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <p className="font-semibold text-stone-800">{user?.fullName}</p>
          <p className="text-sm text-stone-400">{user?.email}</p>
          {user?.emailVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
              <CheckCircle size={10} /> Email đã xác thực
            </span>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Họ và tên
          </label>
          <input
            {...register("fullName")}
            className={cn(
              "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300",
              errors.fullName ? "border-red-300 bg-red-50" : "border-stone-200",
            )}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Số điện thoại
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="0901234567"
            className={cn(
              "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300",
              errors.phone ? "border-red-300 bg-red-50" : "border-stone-200",
            )}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email
          </label>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-stone-100 text-sm text-stone-400 bg-stone-50 cursor-not-allowed"
          />
          <p className="text-xs text-stone-400 mt-1">
            Email không thể thay đổi
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        Lưu thay đổi
      </button>
    </form>
  );
}

// ─── Password Tab ─────────────────────────────────────────────
function PasswordTab() {
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
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
  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][s];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-emerald-500",
  ][s];

  const onSubmit = async (data: PasswordForm) => {
    try {
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch {
      toast.error("Mật khẩu hiện tại không đúng");
    }
  };

  const Field = ({ label, name, show, toggle, error }: any) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          {...register(name)}
          type={show ? "text" : "password"}
          className={cn(
            "w-full px-4 py-3 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300",
            error ? "border-red-300 bg-red-50" : "border-stone-200",
          )}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <ShieldCheck
          size={18}
          className="text-amber-500 flex-shrink-0 mt-0.5"
        />
        <p className="text-xs text-amber-700 leading-relaxed">
          Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
        </p>
      </div>

      <Field
        label="Mật khẩu hiện tại"
        name="currentPassword"
        show={showCur}
        toggle={() => setShowCur(!showCur)}
        error={errors.currentPassword}
      />
      <Field
        label="Mật khẩu mới"
        name="newPassword"
        show={showNew}
        toggle={() => setShowNew(!showNew)}
        error={errors.newPassword}
      />

      {newPass && (
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  i <= s ? strengthColor : "bg-stone-200",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-stone-400">
            {strengthLabel && `Độ mạnh: ${strengthLabel}`}
          </p>
        </div>
      )}

      <Field
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        show={showCon}
        toggle={() => setShowCon(!showCon)}
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        Đổi mật khẩu
      </button>
    </form>
  );
}

// ─── Address Tab ──────────────────────────────────────────────
function AddressTab() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AddressResponse | null>(null);

  const fetchAddresses = async () => {
    try {
      const { data } = await userApi.getAddresses();
      setAddresses(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  const openNew = () => {
    reset();
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (addr: AddressResponse) => {
    setEditing(addr);
    Object.entries(addr).forEach(([k, v]) => setValue(k as any, v));
    setShowForm(true);
  };

  const onSubmit = async (data: AddressForm) => {
    try {
      if (editing) {
        await userApi.updateAddress(editing.id, data);
        toast.success("Cập nhật địa chỉ thành công!");
      } else {
        await userApi.createAddress(data as any);
        toast.success("Thêm địa chỉ thành công!");
      }
      setShowForm(false);
      fetchAddresses();
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await userApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Đã xóa địa chỉ");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  if (loading)
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 bg-stone-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      {!showForm ? (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin
                size={40}
                strokeWidth={1}
                className="mx-auto mb-3 text-stone-300"
              />
              <p className="text-stone-500 font-medium mb-1">
                Chưa có địa chỉ nào
              </p>
              <p className="text-stone-400 text-sm mb-5">
                Thêm địa chỉ giao hàng để đặt hàng nhanh hơn
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                    addr.isDefault
                      ? "border-rose-200 bg-rose-50"
                      : "border-stone-100 bg-white hover:border-stone-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                      addr.isDefault ? "bg-rose-100" : "bg-stone-100",
                    )}
                  >
                    {addr.isDefault ? (
                      <Home size={16} className="text-rose-600" />
                    ) : (
                      <Briefcase size={16} className="text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-stone-800">
                        {addr.fullName}
                      </p>
                      <p className="text-sm text-stone-500">{addr.phone}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">
                      {[addr.street, addr.ward, addr.district, addr.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(addr)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openNew}
            className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-stone-200 hover:border-rose-300 hover:text-rose-600 text-stone-400 rounded-2xl transition-colors text-sm font-medium justify-center"
          >
            <Plus size={16} /> Thêm địa chỉ mới
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-stone-800">
              {editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-stone-400 hover:text-stone-600"
            >
              Hủy
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Họ và tên người nhận",
                name: "fullName",
                placeholder: "Nguyễn Văn A",
              },
              {
                label: "Số điện thoại",
                name: "phone",
                placeholder: "0901234567",
              },
              {
                label: "Tỉnh / Thành phố",
                name: "city",
                placeholder: "Hà Nội",
              },
              {
                label: "Quận / Huyện",
                name: "district",
                placeholder: "Đống Đa",
              },
              {
                label: "Phường / Xã (không bắt buộc)",
                name: "ward",
                placeholder: "Phường Ô Chợ Dừa",
              },
            ].map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {label}
                </label>
                <input
                  {...register(name as any)}
                  placeholder={placeholder}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300",
                    (errors as any)[name]
                      ? "border-red-300 bg-red-50"
                      : "border-stone-200",
                  )}
                />
                {(errors as any)[name] && (
                  <p className="text-red-500 text-xs mt-1">
                    {(errors as any)[name]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Địa chỉ cụ thể
              </label>
              <input
                {...register("street")}
                placeholder="Số nhà, tên đường, tòa nhà..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-300",
                  errors.street
                    ? "border-red-300 bg-red-50"
                    : "border-stone-200",
                )}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.street.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("isDefault")}
              type="checkbox"
              className="accent-rose-600 w-4 h-4"
            />
            <span className="text-sm text-stone-700">
              Đặt làm địa chỉ mặc định
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Cập nhật" : "Thêm địa chỉ"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login?redirect=/profile");
  }, [isAuthenticated]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 font-serif">
          Tài khoản của tôi
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Quản lý thông tin và bảo mật tài khoản
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar nav */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-3 h-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === key
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-800",
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 lg:p-8">
          <h2 className="text-lg font-bold text-stone-800 mb-6">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h2>
          {activeTab === "info" && <ProfileTab />}
          {activeTab === "password" && <PasswordTab />}
          {activeTab === "address" && <AddressTab />}
        </div>
      </div>
    </div>
  );
}
