import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "IndusAI | Industrial approvals",
  description: "AI-powered industrial approvals and compliance intelligence"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f9fb] text-[#172b3a] antialiased">
        {children}
      </body>
    </html>
  );
}
