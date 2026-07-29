import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DEFAULT_SEO } from "@/constants/seo";

export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_SEO.url),
  title: {
    default: DEFAULT_SEO.title,
    template: `%s | ${DEFAULT_SEO.siteName}`,
  },
  description: DEFAULT_SEO.description,
  openGraph: {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    url: DEFAULT_SEO.url,
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    creator: DEFAULT_SEO.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        style={
          {
            "--font-sans":
              "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
            "--font-geist-mono":
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
          } as React.CSSProperties
        }
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
