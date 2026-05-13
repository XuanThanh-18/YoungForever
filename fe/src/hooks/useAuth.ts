import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isAdmin,
    setAuth,
    logout: storeLogout,
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    const { accessToken, refreshToken, user: userData } = data.data;
    setAuth(userData, accessToken, refreshToken);
    toast.success(`Chào mừng, ${userData.fullName}!`);
    router.push(userData.role === "ADMIN" ? "/admin" : "/");
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    await authApi.register({ email, password, fullName });
    toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
    router.push("/login");
  };

  const logout = () => {
    storeLogout();
    toast.success("Đã đăng xuất");
    router.push("/");
  };

  return { user, isAuthenticated, isAdmin, login, register, logout };
}
