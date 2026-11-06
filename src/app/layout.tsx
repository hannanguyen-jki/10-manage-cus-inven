import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "JKI OCEAN – Quản lý khách hàng",
  description: "Theo dõi khách hàng, tình trạng thanh toán và tạo báo giá",
  icons: { icon: "/favicon.png", apple: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-ink-900 font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
