"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteParticipantAction,
  upsertParticipantAction,
} from "@/lib/actions/participants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TripParticipant } from "@prisma/client";

interface ParticipantListProps {
  tripId: string;
  participants: Pick<TripParticipant, "id" | "name" | "weight" | "createdAt">[];
}

export function ParticipantList({ tripId, participants }: ParticipantListProps) {
  if (!participants.length) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          No participants yet. Add a few people above to start tracking
          expenses.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <ParticipantRow
          key={participant.id}
          tripId={tripId}
          participant={participant}
        />
      ))}
    </div>
  );
}

interface ParticipantRowProps {
  tripId: string;
  participant: Pick<TripParticipant, "id" | "name" | "weight" | "createdAt">;
}

function ParticipantRow({ tripId, participant }: ParticipantRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(participant.name);
  const [weight, setWeight] = useState(participant.weight.toString());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      setError(null);
      const result = await upsertParticipantAction({
        tripId,
        participantId: participant.id,
        name,
        weight,
      });

      if (!result.ok) {
        setError(
          result.errors?.name ??
            result.errors?.weight ??
            result.errors?.form ??
            "Unable to save participant"
        );
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    const confirmation = window.confirm(
      `Remove ${participant.name}? They must not be linked to any expenses.`
    );
    if (!confirmation) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await deleteParticipantAction({
        tripId,
        participantId: participant.id,
      });

      if (!result.ok) {
        setError(result.errors?.form ?? "Unable to delete participant");
        return;
      }

      router.refresh();
    });
  };

  return (
    <Card className="border-border/80">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr] sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor={`participant-name-${participant.id}`}>Name</Label>
            {isEditing ? (
              <Input
                id={`participant-name-${participant.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            ) : (
              <p className="text-base font-medium">{participant.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`participant-weight-${participant.id}`}>
              Weight
            </Label>
            {isEditing ? (
              <Input
                id={`participant-weight-${participant.id}`}
                type="number"
                min={1}
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
            ) : (
              <p className="text-base font-semibold">{participant.weight}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setName(participant.name);
                  setWeight(participant.weight.toString());
                  setError(null);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isPending}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isPending}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending}
              >
                Remove
              </Button>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive sm:col-span-full">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
