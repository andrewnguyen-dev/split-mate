"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { TransferList } from "@/components/trips/transfer-list";
import type { SettlementTransfer } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

interface TransferSummaryProps {
  transfers: SettlementTransfer[];
  balances: {
    participantId: string;
    name: string;
    weight: number;
    paidCents: number;
    owedCents: number;
    balanceCents: number;
  }[];
  currency: string;
  totalCents: number;
}

export function TransferSummary({ transfers, balances, currency, totalCents }: TransferSummaryProps) {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const debtors = balances.filter((balance) => balance.balanceCents < 0);
  const creditors = balances.filter((balance) => balance.balanceCents > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settle Up</h2>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardDescription>Generate the minimal set of transfers to balance the books.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen((prev) => !prev)}>
              {open ? "Hide transfers" : "Show transfers"}
            </Button>
          </div>
        </CardHeader>

        {open && (
          <>
            <CardContent>
              <TransferList transfers={transfers} currency={currency} />
            </CardContent>
            <Button
              variant={showDetails ? "default" : "outline"}
              size="sm"
              className="ml-4 mb-4"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Hide explanation" : "Explain settle-up"}
            </Button>
          </>
        )}

        {showDetails && (
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md border border-muted/60 bg-muted/20 px-4 py-3">
              <p className="font-medium text-foreground">Trip total: {formatCurrency(totalCents, currency)}</p>
              <p className="text-muted-foreground">Every participant&apos;s share comes from the weighted split of this amount.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">Individual balances</h3>
              <p className="text-muted-foreground">Paid − Share owed = Balance (positive means they should receive money).</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-border/70">
                <table className="min-w-full divide-y divide-border/70 text-left">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                      <th className="px-4 py-3 font-semibold">Paid</th>
                      <th className="px-4 py-3 font-semibold">Share</th>
                      <th className="px-4 py-3 font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background text-xs sm:text-sm">
                    {balances.map((balance) => (
                      <tr key={balance.participantId}>
                        <td className="px-4 py-3 font-medium text-foreground">{balance.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{balance.weight}</td>
                        <td className="px-4 py-3">{formatCurrency(balance.paidCents, currency)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(balance.owedCents, currency)}</td>
                        <td
                          className={`px-4 py-3 font-semibold ${
                            balance.balanceCents > 0
                              ? "text-emerald-600"
                              : balance.balanceCents < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(balance.balanceCents, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">Why these transfers</h3>
              {transfers.length === 0 ? (
                <p className="text-muted-foreground">Everyone is even—no money needs to change hands.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    {creditors.length
                      ? `${creditors
                          .map((creditor) => `${creditor.name} is owed ${formatCurrency(creditor.balanceCents, currency)}`)
                          .join(", ")}.`
                      : "No one is owed money."}
                  </p>
                  <p className="text-muted-foreground">
                    {debtors.length
                      ? `${debtors
                          .map((debtor) => `${debtor.name} owes ${formatCurrency(Math.abs(debtor.balanceCents), currency)}`)
                          .join(", ")}.`
                      : "No one owes money."}
                  </p>
                  <div className="space-y-2">
                    {transfers.map((transfer, index) => (
                      <div
                        key={`${transfer.fromParticipantId}-${transfer.toParticipantId}-${index}`}
                        className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3"
                      >
                        <p className="font-medium text-foreground">
                          {transfer.fromName} pays {transfer.toName} {formatCurrency(transfer.amountCents, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transfer.fromName} owed{" "}
                          {formatCurrency(
                            Math.abs(balances.find((balance) => balance.participantId === transfer.fromParticipantId)?.balanceCents ?? 0),
                            currency
                          )}{" "}
                          and this transfer settles part or all of that amount.
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
