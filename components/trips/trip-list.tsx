import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense, Trip, TripParticipant } from "@prisma/client";

type TripWithRelations = Trip & {
  participants: TripParticipant[];
  expenses: Expense[];
};

interface TripListProps {
  trips: TripWithRelations[];
}

export function TripList({ trips }: TripListProps) {
  if (!trips.length) {
    return (
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>No trips yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Start by creating a trip above. Your recent adventures will show up
          here so you can jump back in anytime.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const totalCents = trip.expenses.reduce(
          (total, expense) => total + expense.amountCents,
          0
        );

        return (
          <Link key={trip.id} href={`/trip/${trip.id}`}>
            <Card className="h-full transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-lg">
                    {trip.name}
                  </CardTitle>
                  <Badge variant="soft">{trip.currency}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-semibold">
                    {trip.participants.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expenses</span>
                  <span className="font-semibold">{trip.expenses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {formatCurrency(totalCents, trip.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(trip.updatedAt)}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
