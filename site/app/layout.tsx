import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paper Lab Classroom Builder",
  description: "沿用原始 PDF，建立讓講師看見共同困惑的雙螢幕互動課堂。",
  openGraph: {
    title: "Paper Lab Classroom Builder",
    description: "PDF 進來，互動課堂出去；講師、投影與學生端共用同一份課程資料。",
    images: [{ url: "/paper-lab-social.png", width: 1200, height: 630, alt: "從研究 PDF 到互動課堂問題牆的 Paper Lab 流程" }],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paper Lab Classroom Builder",
    description: "沿用原始 PDF，建立讓講師看見共同困惑的雙螢幕互動課堂。",
    images: ["/paper-lab-social.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
