import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "YoungForever – Mỹ phẩm cao cấp",
    template: "%s | YoungForever",
  },
  description:
    "Thương hiệu mỹ phẩm cao cấp – Làm đẹp tự nhiên, tự tin mỗi ngày",
  keywords: ["mỹ phẩm", "skincare", "làm đẹp", "youngforever"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-white text-stone-800">
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#1c1917",
                border: "1px solid #f3f4f6",
                borderRadius: "12px",
                fontSize: "14px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              },
              success: { iconTheme: { primary: "#e11d48", secondary: "#fff" } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
