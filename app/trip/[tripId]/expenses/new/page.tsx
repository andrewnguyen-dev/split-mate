import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AddExpenseForm } from "@/components/trips/add-expense-form";

interface NewExpensePageProps {
  params: Promise<{ tripId: string }>;
}

export default async function NewExpensePage({
  params,
}: NewExpensePageProps) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      currency: true,
      participants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, weight: true },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AddExpenseForm
        tripId={trip.id}
        currency={trip.currency}
        participants={trip.participants}
      />
    </div>
  );
}
