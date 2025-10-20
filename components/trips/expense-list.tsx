import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  calculateExpenseShares,
  type ExpenseWithDetails,
} from "@/lib/calculations";

interface ExpenseListProps {
  expenses: ExpenseWithDetails[];
  currency: string;
}

export function ExpenseList({ expenses, currency }: ExpenseListProps) {
  if (!expenses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No expenses yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Record your first expense to see a running history here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const shares = calculateExpenseShares(expense);
        return (
          <Card key={expense.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {expense.description}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(expense.date)} &middot; Paid by {expense.payer.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="soft" className="text-base font-semibold">
                  {formatCurrency(expense.amountCents, currency)}
                </Badge>
                <Link
                  href={`/trip/${expense.tripId}/expenses/${expense.id}/edit`}
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Edit
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-xs uppercase text-muted-foreground">
                Split between
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {shares.map((share) => (
                  <div
                    key={`${expense.id}-${share.participantId}`}
                    className="flex items-center justify-between rounded-md border border-muted bg-muted/40 px-3 py-2"
                  >
                    <span>{share.name}</span>
                    <span className="font-medium">
                      {formatCurrency(share.amountCents, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
