import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import StoreChatWidget from "./components/chat/StoreChatWidget";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextStore | Modern E-commerce",
  description:
    "Discover quality products powered by Fake Store API and Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col antialiased bg-white text-neutral-900`}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <StoreChatWidget />
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
