import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.riskbusters.co.in"),
  title: {
    default: "RiskBusters — Security Threat & Risk Management",
    template: "%s | RiskBusters",
  },
  description: "Comprehensive security risk management, threat intelligence, and risk mitigation templates.",
  keywords: ["Security Risk Management", "Risk Assessment", "Threat Intelligence", "RiskBusters"],
  authors: [{ name: "RiskBusters" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "RiskBusters — Security Threat & Risk Management",
    description: "Comprehensive security risk management, threat intelligence, and risk mitigation templates.",
    url: "https://www.riskbusters.co.in",
    siteName: "RiskBusters",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RiskBusters — Security Threat & Risk Management",
    description: "Comprehensive security risk management, threat intelligence, and risk mitigation templates.",
  },
  alternates: {
    canonical: "https://www.riskbusters.co.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-[#111827]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
