import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";

import { getGeneral } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Casita Julia",
    template: "%s · Casita Julia",
  },
  description: "A private family home in Deià, Mallorca.",
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/villa", label: "Photos" },
  { href: "/info", label: "Info" },
  { href: "/calendar", label: "Calendar" },
];

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const general = await getGeneral().catch(() => null);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="font-serif text-xl font-semibold tracking-tight"
            >
              Casita Julia
            </Link>
            <nav className="flex gap-5 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-6 py-6 text-sm text-muted">
            {general?.footerNote ??
              "A private family home in Deià, Mallorca — please treat it with care."}
          </div>
        </footer>
      </body>
    </html>
  );
}
