import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL('https://x402.peacprotocol.org'),
  title: "x402 + PEAC | Verifiable Receipts for Paid API Calls",
  description: "Every 200 OK comes with a cryptographic receipt. Agent-to-agent commerce with HTTP 402 payments on Base/USDC.",
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "x402 + PEAC | Verifiable Receipts for Paid API Calls",
    description: "Agent-to-agent commerce with verifiable receipts. Try the live demo.",
    url: "https://x402.peacprotocol.org",
    siteName: "PEAC Protocol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "x402 + PEAC | Verifiable Receipts",
    description: "Agent-to-agent commerce with cryptographic receipts",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9ZQQLS64KJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9ZQQLS64KJ');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
