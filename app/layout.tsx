import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vibe Scaffold - Turn Ideas into Crystal Clear Specs",
  description: "A friendly 4-step wizard that helps you define, design, and plan your next app idea. AI-powered chat generates comprehensive technical specs, dev plans, and agent guidance.",
  keywords: ["AI specs", "technical documentation", "product requirements", "dev planning", "software architecture", "project planning"],
  authors: [{ name: "Vibe Scaffold" }],
  openGraph: {
    title: "Vibe Scaffold - Turn Ideas into Crystal Clear Specs",
    description: "A friendly 4-step wizard that helps you define, design, and plan your next app idea with AI-powered spec generation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Scaffold - Turn Ideas into Crystal Clear Specs",
    description: "AI-powered wizard for generating comprehensive technical specs and development plans.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
