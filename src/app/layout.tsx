import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "BookedMove - Online Booking for Moving Companies", description: "24/7 booking widget for movers", icons: { icon: "/images/2026-02-12-bookedmove-icon.png" } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={inter.className}>{children}</body></html>;
}
