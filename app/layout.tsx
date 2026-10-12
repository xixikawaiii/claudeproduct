import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "600"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.bio,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
