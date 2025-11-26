import type { Metadata } from "next";
import "./globals.css";
import PWAInstall from "@/app/components/PWAInstall";
import Navigation from "@/app/components/Navigation";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Mix Factory",
  description: "Find and book professional DJs for your events",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mix Factory",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale = "en" } = await params;

  return (
    <html lang={locale}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <Providers>
          <Navigation />
          <main>{children}</main>
          <PWAInstall />
        </Providers>
      </body>
    </html>
  );
}
