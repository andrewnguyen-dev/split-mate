"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTripAction } from "@/lib/actions/trips";
import type { ActionErrorBag } from "@/lib/actions/helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Step = 1 | 2;

interface ParticipantDraft {
  key: string;
  name: string;
  weight: number;
}

const createDraftParticipant = (): ParticipantDraft => ({
  key: Math.random().toString(36).slice(2),
  name: "",
  weight: 1,
});

export function CreateTripForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ActionErrorBag>({});
  const [tripName, setTripName] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [participants, setParticipants] = useState<ParticipantDraft[]>(() =>
    Array.from({ length: 2 }).map(createDraftParticipant)
  );

  const participantError = errors.participants ?? errors.form;

  const completedSteps = useMemo(() => (step === 2 ? 1 : 0), [step]);

  const updateParticipant = (
    key: string,
    field: keyof Omit<ParticipantDraft, "key">,
    value: string
  ) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.key === key
          ? {
              ...participant,
              [field]:
                field === "weight" ? Math.max(1, Number(value) || 1) : value,
            }
          : participant
      )
    );
  };

  const removeParticipant = (key: string) => {
    setParticipants((prev) =>
      prev.length > 1 ? prev.filter((participant) => participant.key !== key) : prev
    );
  };

  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    if (!tripName.trim()) {
      setErrors({ name: "Trip name is required" });
      return;
    }

    setStep(2);
  };

  const resetForm = () => {
    setTripName("");
    setCurrency("AUD");
    setParticipants(Array.from({ length: 2 }).map(createDraftParticipant));
    setErrors({});
    setStep(1);
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const cleanedParticipants = participants
      .map((participant) => ({
        name: participant.name.trim(),
        weight: participant.weight,
      }))
      .filter((participant) => Boolean(participant.name));

    startTransition(async () => {
      const result = await createTripAction({
        name: tripName.trim(),
        currency,
        participants: cleanedParticipants,
      });

      if (!result.ok) {
        setErrors(result.errors ?? {});
        if (result.errors?.name || result.errors?.currency) {
          setStep(1);
        }
        return;
      }

      resetForm();
      router.push(`/trip/${result.data?.tripId}`);
    });
  };

  return (
    <Card className="border-dashed border-primary/40 bg-accent/10">
      <CardHeader>
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-primary">
          <Badge variant="soft">
            Step {completedSteps + 1} of 2
          </Badge>
          <span>{step === 1 ? "Trip details" : "Add participants"}</span>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleNext}>
            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip name</Label>
              <Input
                id="trip-name"
                value={tripName}
                onChange={(event) => setTripName(event.target.value)}
                placeholder="Weekend in Byron Bay"
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip-currency">Currency</Label>
              <Input
                id="trip-currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
                maxLength={3}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Use a three-letter currency code. Defaults to AUD.
              </p>
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit">Next</Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.key}
                  className="rounded-lg border border-border bg-card/60 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                    <span>Participant {index + 1}</span>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.key)}
                        className="text-xs font-semibold text-destructive"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr] sm:items-end">
                    <div className="space-y-2">
                      <Label htmlFor={`participant-name-${participant.key}`}>
                        Name
                      </Label>
                      <Input
                        id={`participant-name-${participant.key}`}
                        value={participant.name}
                        onChange={(event) =>
                          updateParticipant(
                            participant.key,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Jess"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`participant-weight-${participant.key}`}>
                        Weight
                      </Label>
                      <Input
                        id={`participant-weight-${participant.key}`}
                        type="number"
                        min={1}
                        value={participant.weight}
                        onChange={(event) =>
                          updateParticipant(
                            participant.key,
                            "weight",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {participantError && (
              <p className="text-sm text-destructive">{participantError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setParticipants((prev) => [...prev, createDraftParticipant()])
                }
              >
                Add participant
              </Button>
            </div>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={isPending}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isPending}>
                  Create trip
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
      {errors.form && step === 1 && (
        <CardFooter>
          <p className="text-sm text-destructive">{errors.form}</p>
        </CardFooter>
      )}
    </Card>
  );
}
