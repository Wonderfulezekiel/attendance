import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Attendance — Smart Lecture Attendance",
  description:
    "Modern QR-based lecture attendance management system. Fast check-ins, real-time tracking, and automated alerts for universities.",
  keywords: ["attendance", "university", "QR code", "lecture", "tracking"],
};

// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import Script from "next/script"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <Script
          src="https://tweakcn.com/live-preview.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}