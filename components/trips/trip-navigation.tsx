"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface TripNavigationProps {
  tripId: string;
}

const linkConfig = [
  { segment: "", label: "Overview" },
  { segment: "/participants", label: "Participants" },
  { segment: "/expenses/new", label: "Add expense" },
];

export function TripNavigation({ tripId }: TripNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {linkConfig.map(({ segment, label }) => {
        const href = `/trip/${tripId}${segment}`;
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 font-medium transition",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
