"use server";

import { ok, fail, ActionResult, mapZodErrors } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { participantUpsertSchema, tripIdSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function upsertParticipantAction(
  input: unknown
): Promise<ActionResult<{ participantId: string }>> {
  const parsed = participantUpsertSchema.safeParse(input);

  if (!parsed.success) {
    return fail(mapZodErrors(parsed.error));
  }

  const { participantId, name, weight, tripId } = parsed.data;

  let participant;

  if (participantId) {
    const existing = await prisma.tripParticipant.findUnique({
      where: { id: participantId },
    });

    if (!existing || existing.tripId !== tripId) {
      return fail({ form: "Participant not found for this trip" });
    }

    participant = await prisma.tripParticipant.update({
      where: { id: participantId },
      data: { name, weight },
    });
  } else {
    participant = await prisma.tripParticipant.create({
      data: { name, weight, tripId },
    });
  }

  revalidatePath(`/trip/${tripId}`);
  revalidatePath(`/trip/${tripId}/participants`);

  return ok({ participantId: participant.id });
}

interface DeleteParticipantInput {
  tripId: string;
  participantId: string;
}

export async function deleteParticipantAction({
  tripId,
  participantId,
}: DeleteParticipantInput): Promise<ActionResult<{ participantId: string }>> {
  const parsedTripId = tripIdSchema.safeParse(tripId);
  if (!parsedTripId.success) {
    return fail({ form: "Invalid trip id" });
  }

  const participant = await prisma.tripParticipant.findUnique({
    where: { id: participantId },
    include: { paid: true, expenses: true },
  });

  if (!participant || participant.tripId !== tripId) {
    return fail({ form: "Participant not found" });
  }

  if (participant.paid.length || participant.expenses.length) {
    return fail({
      form: "Remove expenses for this participant before deleting them.",
    });
  }

  await prisma.tripParticipant.delete({
    where: { id: participantId },
  });

  revalidatePath(`/trip/${tripId}`);
  revalidatePath(`/trip/${tripId}/participants`);

  return ok({ participantId });
}

export async function upsertParticipantFormAction(
  _prevState: ActionResult<{ participantId: string }>,
  formData: FormData
) {
  const payload = {
    tripId: String(formData.get("tripId") ?? ""),
    participantId: formData.get("participantId")
      ? String(formData.get("participantId"))
      : undefined,
    name: String(formData.get("name") ?? ""),
    weight: String(formData.get("weight") ?? ""),
  };

  return upsertParticipantAction(payload);
}

export async function deleteParticipantFormAction(
  _prevState: ActionResult<{ participantId: string }>,
  formData: FormData
) {
  const payload: DeleteParticipantInput = {
    tripId: String(formData.get("tripId") ?? ""),
    participantId: String(formData.get("participantId") ?? ""),
  };

  return deleteParticipantAction(payload);
}
