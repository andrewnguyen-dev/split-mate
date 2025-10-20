import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AddParticipantForm } from "@/components/trips/add-participant-form";
import { ParticipantList } from "@/components/trips/participant-list";

interface ParticipantsPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function ParticipantsPage({
  params,
}: ParticipantsPageProps) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      currency: true,
      participants: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          weight: true,
          createdAt: true,
        },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AddParticipantForm tripId={trip.id} />
      <ParticipantList tripId={trip.id} participants={trip.participants} />
    </div>
  );
}
