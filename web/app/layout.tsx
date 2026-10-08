import type { Metadata } from "next";
// Self-hosted via Fontsource (no Google Fonts network dependency at build/run).
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "./globals.css";
import { RegisterSW } from "./components/RegisterSW";

export const metadata: Metadata = {
  title: "Alaba Dorf Outlet",
  description:
    "Order farm eggs, shared meat, eatery food and photo studio sessions — Alaba Dorf Outlet.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Alaba Dorf", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  themeColor: "#6B9E0E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
