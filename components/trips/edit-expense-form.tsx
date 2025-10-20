"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

import { updateExpenseAction } from "@/lib/actions/expenses";
import type { ActionErrorBag } from "@/lib/actions/helpers";
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
import { Select } from "@/components/ui/select";
import type { TripParticipant } from "@prisma/client";
import { cn } from "@/lib/utils";

interface EditExpenseFormProps {
  tripId: string;
  currency: string;
  participants: Pick<TripParticipant, "id" | "name" | "weight">[];
  expense: {
    id: string;
    description: string;
    amountCents: number;
    payerId: string;
    date: Date;
    participants: { participantId: string }[];
  };
}

const dateToInputString = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function EditExpenseForm({
  tripId,
  currency,
  participants,
  expense,
}: EditExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ActionErrorBag>({});
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(() => (expense.amountCents / 100).toString());
  const [date, setDate] = useState(() => dateToInputString(expense.date));
  const [payerId, setPayerId] = useState<string>(expense.payerId);
  const [participantIds, setParticipantIds] = useState<Set<string>>(
    () => new Set(expense.participants.map((p) => p.participantId))
  );

  useEffect(() => {
    if (!participants.find((participant) => participant.id === payerId)) {
      setPayerId(participants[0]?.id ?? "");
    }
  }, [participants, payerId]);

  const participantOptions = useMemo(
    () =>
      participants.map((participant) => ({
        id: participant.id,
        label: `${participant.name}`,
      })),
    [participants]
  );

  const toggleParticipant = (id: string, checked: boolean) => {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const selectAll = () =>
    setParticipantIds(new Set(participants.map((participant) => participant.id)));

  const clearAll = () => setParticipantIds(new Set());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result = await updateExpenseAction({
        expenseId: expense.id,
        tripId,
        description: description.trim(),
        amountCents: amount,
        payerId,
        participantIds: Array.from(participantIds),
        date,
      });

      if (!result.ok) {
        setErrors(result.errors ?? {});
        return;
      }

      router.push(`/trip/${tripId}`);
      router.refresh();
    });
  };

  if (!participants.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit expense</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add participants before editing expenses.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit expense</CardTitle>
        <CardDescription className="max-w-prose">
          Update the details and who shares this expense. Weights adjust splits automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Groceries"
                required
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount ({currency})</Label>
              <Input
                id="expense-amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="125.50"
                inputMode="decimal"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter numbers only, up to two decimal places.
              </p>
              {errors.amountCents && (
                <p className="text-sm text-destructive">
                  {errors.amountCents}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-payer">Payer</Label>
              <Select
                id="expense-payer"
                value={payerId}
                onChange={(event) => setPayerId(event.target.value)}
                name="payerId"
                required
              >
                {participantOptions.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.label}
                  </option>
                ))}
              </Select>
              {errors.payerId && (
                <p className="text-sm text-destructive">{errors.payerId}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Participants</Label>
                <p className="text-xs text-muted-foreground">
                  Select who shares this expense. Weights adjust splits
                  automatically.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="font-semibold text-primary"
                  onClick={selectAll}
                >
                  Select all
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  className="font-semibold text-primary"
                  onClick={clearAll}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {participantOptions.map((participant) => {
                const checked = participantIds.has(participant.id);
                return (
                  <label
                    key={participant.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition",
                      checked
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="font-medium">{participant.label}</span>
                    <input
                      type="checkbox"
                      name="participantIds"
                      value={participant.id}
                      checked={checked}
                      onChange={(event) =>
                        toggleParticipant(participant.id, event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
            {errors.participants && (
              <p className="text-sm text-destructive">{errors.participants}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-sm text-destructive">{errors.form}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/trip/${tripId}`)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

