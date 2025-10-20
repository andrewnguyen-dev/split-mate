import { formatCurrency } from "@/lib/utils";
import type { ParticipantBalance } from "@/lib/calculations";

interface ParticipantBalanceTableProps {
  balances: ParticipantBalance[];
  currency: string;
}

export function ParticipantBalanceTable({
  balances,
  currency,
}: ParticipantBalanceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <table className="min-w-full divide-y divide-border/70 text-sm">
        <thead className="bg-muted/60 text-left uppercase text-xs tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Participant</th>
            <th className="px-4 py-3 font-semibold">Weight</th>
            <th className="px-4 py-3 font-semibold">Paid</th>
            <th className="px-4 py-3 font-semibold">Owes</th>
            <th className="px-4 py-3 font-semibold">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-background">
          {balances.map((balance) => (
            <tr key={balance.participantId}>
              <td className="px-4 py-3 font-medium text-foreground">
                {balance.name}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {balance.weight}
              </td>
              <td className="px-4 py-3">
                {formatCurrency(balance.paidCents, currency)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatCurrency(balance.owedCents, currency)}
              </td>
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
  );
}
