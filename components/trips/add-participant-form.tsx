"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { upsertParticipantFormAction } from "@/lib/actions/participants";
import type { ActionResult } from "@/lib/actions/helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddParticipantFormProps {
  tripId: string;
}

const initialState: ActionResult<{ participantId: string }> = { ok: true };

export function AddParticipantForm({ tripId }: AddParticipantFormProps) {
  const [state, formAction] = useFormState(upsertParticipantFormAction, initialState);

  useEffect(() => {
    if (state.ok) {
      const form = document.getElementById("add-participant-form") as
        | HTMLFormElement
        | null;
      form?.reset();
    }
  }, [state.ok]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add someone new</CardTitle>
        <CardDescription className="max-w-prose">
          Add participants who can be selected on expenses. Use weights to represent the number of people in a household, preventing internal money transfers when settling up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="add-participant-form"
          className="grid gap-4 sm:grid-cols-[2fr_1fr_auto]"
          action={formAction}
        >
          <input type="hidden" name="tripId" value={tripId} />
          <div className="space-y-2">
            <Label htmlFor="participant-name">Name</Label>
            <Input
              id="participant-name"
              name="name"
              placeholder="Alex"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="participant-weight">Weight</Label>
            <Input
              id="participant-weight"
              name="weight"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
            {state.errors?.weight && (
              <p className="text-sm text-destructive">{state.errors.weight}</p>
            )}
          </div>
          <SubmitButton />
          {state.errors?.form && (
            <p className="text-sm text-destructive sm:col-span-full">
              {state.errors.form}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="self-end" isLoading={pending}>
      Add
    </Button>
  );
}
