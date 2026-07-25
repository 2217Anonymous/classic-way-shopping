import type { Metadata } from "next";
import { Poppins, Quicksand } from "next/font/google";
import StoreProvider from "@/store/provider";
import SiteShell from "@/components/layout/SiteShell";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: {
    default: "Valaiyagam Fashion - T-Shirt Store",
    template: "%s | Valaiyagam Fashion",
  },
  description:
    "Valaiyagam Fashion — premium T-shirts and apparel. Shop new arrivals, deals, and everyday essentials.",
  keywords: ["Valaiyagam", "fashion", "t-shirt", "apparel", "online store"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>
          <SiteShell>{children}</SiteShell>
        </StoreProvider>
      </body>
    </html>
  );
}
