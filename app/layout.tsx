import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoopRank — Northeastern Co-op & Internship Prestige Rankings",
  description:
    "Rank Northeastern University co-op and internship roles by prestige score",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#f5f5f0] text-black antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
