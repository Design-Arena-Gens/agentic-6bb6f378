import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Data Entry Workspace",
  description: "Configurable data entry tool for structured collection and review.",
  metadataBase: new URL("https://agentic-6bb6f378.vercel.app")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
