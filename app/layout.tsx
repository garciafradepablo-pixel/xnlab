import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "XNLAB",
  description: "Creative systems for modern culture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} style={{background:"#060606"}}>
      <body style={{margin:0,padding:0,background:"#060606",overflowX:"hidden"}}>{children}</body>
    </html>
  );
}
