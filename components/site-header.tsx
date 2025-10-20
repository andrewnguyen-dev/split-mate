import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SplitMate
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium uppercase text-muted-foreground sm:inline">
            Crafted by Andrew Nguyen
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
