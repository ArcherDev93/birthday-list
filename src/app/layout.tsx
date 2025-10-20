import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";
import AutoJoinHandler from "@/components/AutoJoinHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lista de Cumpleaños - Colegio Brains",
  description: "Una aplicación colaborativa para organizar cumpleaños de niños y familias, con asistencia y ubicaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <AutoJoinHandler />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
