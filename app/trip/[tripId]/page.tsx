import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { calculateTripSummary, type ExpenseWithDetails } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { SummaryStat } from "@/components/trips/summary-stat";
import { ParticipantBalanceTable } from "@/components/trips/participant-balance-table";
import { TransferSummary } from "@/components/trips/transfer-summary";
import { ExpenseList } from "@/components/trips/expense-list";

interface TripDashboardProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDashboard({ params }: TripDashboardProps) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      currency: true,
      participants: {
        orderBy: { createdAt: "asc" },
      },
      expenses: {
        orderBy: { date: "desc" },
        include: {
          payer: true,
          participants: {
            include: {
              participant: true,
            },
          },
        },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  const summary = calculateTripSummary(trip.participants, trip.expenses as ExpenseWithDetails[]);

  const outstanding = summary.balances.reduce((total, balance) => {
    return balance.balanceCents < 0 ? total + Math.abs(balance.balanceCents) : total;
  }, 0);

  const totalPaid = summary.balances.reduce((total, balance) => total + balance.paidCents, 0);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 md:grid-cols-3">
        <SummaryStat
          title="Total spent"
          value={formatCurrency(summary.totalCents, trip.currency)}
          hint={`Across ${trip.expenses.length} expenses`}
        />
        <SummaryStat
          title="Participants"
          value={`${trip.participants.length}`}
          hint={`${totalPaid ? "Active payers" : "Add expenses to begin"}`}
        />
        <SummaryStat
          title="Outstanding"
          value={formatCurrency(outstanding, trip.currency)}
          hint={
            summary.transfers.length
              ? `${summary.transfers.length} transfer${summary.transfers.length === 1 ? "" : "s"} suggested`
              : "All balances settled"
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Expenses</h2>
          <ExpenseList expenses={trip.expenses as ExpenseWithDetails[]} currency={trip.currency} />
        </div>
        <TransferSummary
          transfers={summary.transfers}
          balances={summary.balances}
          totalCents={summary.totalCents}
          currency={trip.currency}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Balances</h2>
          <p className="text-sm text-muted-foreground">Positive balances mean they are owed money.</p>
        </div>
        <ParticipantBalanceTable balances={summary.balances} currency={trip.currency} />
        <p className="text-sm text-muted-foreground">
          &quot;Weight&quot; represents the number of people in a household. This prevents internal money transfers when settling up.
        </p>
      </section>
    </div>
  );
}
