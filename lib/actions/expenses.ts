"use server";

import { ok, fail, ActionResult, mapZodErrors } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { expenseCreateSchema, expenseUpdateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function addExpenseAction(
  input: unknown
): Promise<ActionResult<{ expenseId: string }>> {
  const parsed = expenseCreateSchema.safeParse(input);

  if (!parsed.success) {
    return fail(mapZodErrors(parsed.error));
  }

  const {
    tripId,
    description,
    amountCents,
    payerId,
    participantIds,
    date,
  } = parsed.data;

  const payer = await prisma.tripParticipant.findUnique({
    where: { id: payerId },
    select: { tripId: true },
  });

  if (!payer || payer.tripId !== tripId) {
    return fail({
      payerId: "Payer must be part of this trip",
    });
  }

  const tripParticipants = await prisma.tripParticipant.findMany({
    where: {
      tripId,
      id: { in: participantIds },
    },
    select: { id: true },
  });

  if (tripParticipants.length !== participantIds.length) {
    return fail({
      participants: "Participants must belong to this trip",
    });
  }

  const uniqueParticipantIds = Array.from(new Set(participantIds));

  const expense = await prisma.expense.create({
    data: {
      tripId,
      description,
      amountCents,
      payerId,
      date,
      participants: {
        createMany: {
          data: uniqueParticipantIds.map((id) => ({
            participantId: id,
          })),
        },
      },
    },
  });

  revalidatePath(`/trip/${tripId}`);
  revalidatePath(`/trip/${tripId}/expenses/new`);

  return ok({ expenseId: expense.id });
}

export async function addExpenseFormAction(
  _prevState: ActionResult<{ expenseId: string }>,
  formData: FormData
) {
  const amount = String(formData.get("amount") ?? "");
  const payload = {
    tripId: String(formData.get("tripId") ?? ""),
    description: String(formData.get("description") ?? ""),
    payerId: String(formData.get("payerId") ?? ""),
    participantIds: Array.from(formData.getAll("participantIds")).map((value) =>
      String(value)
    ),
    amountCents: amount,
    date: String(formData.get("date") ?? ""),
  };

  return addExpenseAction(payload);
}

export async function updateExpenseAction(
  input: unknown
): Promise<ActionResult<{ expenseId: string }>> {
  const parsed = expenseUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return fail(mapZodErrors(parsed.error));
  }

  const {
    expenseId,
    tripId,
    description,
    amountCents,
    payerId,
    participantIds,
    date,
  } = parsed.data;

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { id: true, tripId: true },
  });

  if (!expense || expense.tripId !== tripId) {
    return fail({ form: "Expense not found for this trip" });
  }

  const payer = await prisma.tripParticipant.findUnique({
    where: { id: payerId },
    select: { tripId: true },
  });

  if (!payer || payer.tripId !== tripId) {
    return fail({ payerId: "Payer must be part of this trip" });
  }

  const tripParticipants = await prisma.tripParticipant.findMany({
    where: {
      tripId,
      id: { in: participantIds },
    },
    select: { id: true },
  });

  if (tripParticipants.length !== participantIds.length) {
    return fail({ participants: "Participants must belong to this trip" });
  }

  const uniqueParticipantIds = Array.from(new Set(participantIds));

  await prisma.$transaction(async (tx) => {
    await tx.expense.update({
      where: { id: expenseId },
      data: {
        description,
        amountCents,
        payerId,
        date,
      },
    });

    await tx.expenseParticipant.deleteMany({ where: { expenseId } });

    await tx.expenseParticipant.createMany({
      data: uniqueParticipantIds.map((participantId) => ({
        expenseId,
        participantId,
      })),
    });
  });

  revalidatePath(`/trip/${tripId}`);
  revalidatePath(`/trip/${tripId}/expenses/${expenseId}/edit`);

  return ok({ expenseId });
}

export async function updateExpenseFormAction(
  _prevState: ActionResult<{ expenseId: string }>,
  formData: FormData
) {
  const amount = String(formData.get("amount") ?? "");
  const payload = {
    expenseId: String(formData.get("expenseId") ?? ""),
    tripId: String(formData.get("tripId") ?? ""),
    description: String(formData.get("description") ?? ""),
    payerId: String(formData.get("payerId") ?? ""),
    participantIds: Array.from(formData.getAll("participantIds")).map((value) =>
      String(value)
    ),
    amountCents: amount,
    date: String(formData.get("date") ?? ""),
  };

  return updateExpenseAction(payload);
}
