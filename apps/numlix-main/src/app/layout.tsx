import type { Metadata } from "next";
import "./globals.css";
import "@numlix/ui-kit/styles.css";

export const metadata: Metadata = {
  title: "Numlix",
  description: "Numlix calculators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
