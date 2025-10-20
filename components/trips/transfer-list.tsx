import { formatCurrency } from "@/lib/utils";
import type { SettlementTransfer } from "@/lib/calculations";

interface TransferListProps {
  transfers: SettlementTransfer[];
  currency: string;
}

export function TransferList({ transfers, currency }: TransferListProps) {
  if (!transfers.length) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        No transfers are needed.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {transfers.map((transfer, index) => (
        <div
          key={`${transfer.fromParticipantId}-${transfer.toParticipantId}-${index}`}
          className="flex flex-col rounded-md border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="font-medium">
            {transfer.fromName} pays {transfer.toName}
          </span>
          <span className="text-base font-semibold text-primary">
            {formatCurrency(transfer.amountCents, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}
