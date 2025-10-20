import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { EditExpenseForm } from "@/components/trips/edit-expense-form";

interface EditExpensePageProps {
  params: Promise<{ tripId: string; expenseId: string }>;
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const { tripId, expenseId } = await params;

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

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      participants: {
        select: { participantId: true },
      },
    },
  });

  if (!expense || expense.tripId !== tripId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <EditExpenseForm
        tripId={trip.id}
        currency={trip.currency}
        participants={trip.participants}
        expense={expense}
      />
    </div>
  );
}

