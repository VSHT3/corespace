import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { ToastProvider } from "@/lib/toast";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: {
    default: "Corespace — IB Core made manageable",
    template: "%s · Corespace",
  },
  description:
    "AI-powered tools for IB Diploma students. TOK Exhibition helper, CAS tracker, and Extended Essay assistant — built by an IB student, for IB students.",
  keywords: ["IB Diploma", "Theory of Knowledge", "TOK exhibition", "CAS tracker", "Extended Essay", "IB student tools"],
  authors: [{ name: "Corespace" }],
  openGraph: {
    type: "website",
    siteName: "Corespace",
    title: "Corespace — IB Core made manageable",
    description:
      "AI-powered tools for IB Diploma students. TOK Exhibition helper, CAS tracker, and Extended Essay assistant.",
    locale: "en_US",
    images: [{ url: "https://corespace.app/api/og", width: 1200, height: 630, alt: "Corespace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corespace — IB Core made manageable",
    description:
      "AI-powered tools for IB Diploma students. Pick a TOK prompt, build your exhibition, get AI justifications.",
    images: ["https://corespace.app/api/og"],
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
    <html lang="en">
      <body>
        <ToastProvider>
          <ScrollToTop />
          <Navbar />
          {children}
          <Footer />
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
