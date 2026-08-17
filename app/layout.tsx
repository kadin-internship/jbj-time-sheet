import type { Metadata, Viewport } from "next";
import { BRAND_COLORS } from "@/lib/constants/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: "JBJ Time Sheet",
  description: "JBJ employee time sheet portal",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JBJ Time Sheet",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.maroon,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
