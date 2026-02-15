import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://link360.example.com";

export const metadata: Metadata = {
  title: { default: "Link360 Shipping – NorCal to Zambia", template: "%s | Link360" },
  description: "Container shipping interest ledger. Pledge your space for NorCal → Lusaka or Ndola via Walvis Bay.",
  openGraph: {
    title: "Link360 Shipping – NorCal to Zambia",
    description: "Pledge your space for group container shipping from NorCal to Lusaka or Ndola. Interest-only, no payment until confirmed.",
    url: siteUrl,
    siteName: "Link360",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Link360 Shipping – NorCal to Zambia", description: "Pledge your space for group container shipping to Zambia." },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-gray-50 font-sans text-gray-900 antialiased flex flex-col`} suppressHydrationWarning>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
