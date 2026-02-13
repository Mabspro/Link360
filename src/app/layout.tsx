import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Link360 Shipping – NorCal to Zambia",
  description: "Container shipping interest ledger. Pledge your space for NorCal → Lusaka or Ndola.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
