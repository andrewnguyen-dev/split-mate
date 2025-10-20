"use server";

import { prisma } from "@/lib/prisma";
import { ok, ActionResult, mapZodErrors } from "@/lib/actions/helpers";
import { tripCreateSchema, TripCreateInput } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function getTrips() {
  return prisma.trip.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      participants: true,
      expenses: true,
    },
  });
}

export async function createTripAction(
  input: TripCreateInput
): Promise<ActionResult<{ tripId: string }>> {
  const parsed = tripCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: mapZodErrors(parsed.error),
    };
  }

  const { name, currency, participants } = parsed.data;

  const trip = await prisma.trip.create({
    data: {
      name,
      currency,
      participants: {
        createMany: {
          data: participants.map((participant) => ({
            name: participant.name,
            weight: participant.weight,
          })),
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/trip/${trip.id}`);

  return ok({ tripId: trip.id });
}
