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

export const metadata: Metadata = {
  title: "Alaba Dorf Outlet",
  description:
    "Order farm eggs, shared meat, eatery food and photo studio sessions — Alaba Dorf Outlet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
