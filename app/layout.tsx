import type { Metadata, Viewport } from "next";
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

// 1. Configuration du Viewport pour le Mobile
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Empêche le zoom saccadé sur les inputs mobiles
  userScalable: false,
};

// 2. Metadata pour MedGest
export const metadata: Metadata = {
  title: "MedGest | Gestion Hospitalière",
  description: "Système de gestion hospitalière moderne et sécurisé",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
        {/* Le overflow-x-hidden sur le body est la sécurité ultime 
            contre le "débordement" horizontal sur téléphone.
        */}
        {children}
      </body>
    </html>
  );
}