import type { Metadata } from "next";
import { Inter, Noto_Serif_SC } from "next/font/google";
import { SITE } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "600"], variable: "--font-inter" });
const serif = Noto_Serif_SC({ weight: ["400", "600"], preload: false, variable: "--font-serif" });

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.bio,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
