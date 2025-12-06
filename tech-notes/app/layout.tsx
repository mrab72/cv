import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Notes - Maryam Masinan",
  description: "Technical notes on Rust, databases, and system design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
