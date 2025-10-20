import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { TripNavigation } from "@/components/trips/trip-navigation";

interface TripLayoutProps {
  children: ReactNode;
  params: Promise<{ tripId: string }>;
}

export default async function TripLayout({
  children,
  params,
}: TripLayoutProps) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      currency: true,
      updatedAt: true,
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-16 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="text-sm text-muted-foreground">
            Updated {trip.updatedAt.toLocaleString("en-AU")}
          </p>
        </div>
        <Badge variant="soft" className="self-start">
          {trip.currency}
        </Badge>
      </div>

      <TripNavigation tripId={trip.id} />

      <section>{children}</section>
    </div>
  );
}
