import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SplitMate",
  description:
    "Track shared trip expenses, balance contributions, and settle up with friends effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background text-foreground font-sans")}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 px-4 pb-12 pt-4 md:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
