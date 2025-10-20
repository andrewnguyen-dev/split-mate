import type {
  Expense,
  ExpenseParticipant,
  TripParticipant,
} from "@prisma/client";

export interface ExpenseParticipantDetail extends ExpenseParticipant {
  participant: TripParticipant;
}

export interface ExpenseWithDetails extends Expense {
  payer: TripParticipant;
  participants: ExpenseParticipantDetail[];
}

export interface ParticipantBalance {
  participantId: string;
  name: string;
  weight: number;
  paidCents: number;
  owedCents: number;
  balanceCents: number;
}

export interface SettlementTransfer {
  fromParticipantId: string;
  toParticipantId: string;
  amountCents: number;
  fromName: string;
  toName: string;
}

export interface TripSummary {
  totalCents: number;
  balances: ParticipantBalance[];
  transfers: SettlementTransfer[];
}

export interface ExpenseShareBreakdown {
  participantId: string;
  name: string;
  amountCents: number;
}

export function calculateTripSummary(
  participants: TripParticipant[],
  expenses: ExpenseWithDetails[]
): TripSummary {
  const participantMap = new Map<string, ParticipantBalance>();

  participants.forEach((participant) => {
    participantMap.set(participant.id, {
      participantId: participant.id,
      name: participant.name,
      weight: participant.weight,
      paidCents: 0,
      owedCents: 0,
      balanceCents: 0,
    });
  });

  let totalCents = 0;

  expenses.forEach((expense) => {
    totalCents += expense.amountCents;

    const payerBalance = participantMap.get(expense.payerId);
    if (payerBalance) {
      payerBalance.paidCents += expense.amountCents;
    }

    const shareMap = splitExpense(expense.amountCents, expense.participants);

    for (const [participantId, share] of shareMap) {
      const participantBalance = participantMap.get(participantId);
      if (participantBalance) {
        participantBalance.owedCents += share;
      }
    }
  });

  const balances = Array.from(participantMap.values()).map((balance) => ({
    ...balance,
    balanceCents: balance.paidCents - balance.owedCents,
  }));

  const transfers = calculateSettlementTransfers(balances);

  return {
    totalCents,
    balances,
    transfers,
  };
}

function splitExpense(
  amountCents: number,
  participants: ExpenseParticipantDetail[]
) {
  const weightSum = participants.reduce(
    (total, participant) => total + participant.participant.weight,
    0
  );

  if (weightSum === 0) {
    return new Map<string, number>();
  }

  const provisionalShares = participants.map((participant) => {
    const weight = participant.participant.weight;
    const numerator = amountCents * weight;
    const share = Math.floor(numerator / weightSum);
    const remainder = numerator - share * weightSum;

    return {
      participantId: participant.participantId,
      share,
      remainder,
    };
  });

  let allocatedCents = provisionalShares.reduce(
    (total, item) => total + item.share,
    0
  );

  let remainderCents = amountCents - allocatedCents;

  const remainderOrder = [...provisionalShares].sort((a, b) => {
    if (b.remainder === a.remainder) {
      return 0;
    }
    return b.remainder - a.remainder;
  });

  let index = 0;
  while (remainderCents > 0 && remainderOrder.length > 0) {
    const target = remainderOrder[index % remainderOrder.length];
    target.share += 1;
    allocatedCents += 1;
    remainderCents -= 1;
    index += 1;
  }

  const shareMap = new Map<string, number>();

  provisionalShares.forEach((participant) => {
    shareMap.set(participant.participantId, participant.share);
  });

  return shareMap;
}

function calculateSettlementTransfers(
  balances: ParticipantBalance[]
): SettlementTransfer[] {
  const debtors = balances
    .filter((balance) => balance.balanceCents < 0)
    .map((balance) => ({ ...balance }));
  const creditors = balances
    .filter((balance) => balance.balanceCents > 0)
    .map((balance) => ({ ...balance }));

  debtors.sort((a, b) => a.balanceCents - b.balanceCents);
  creditors.sort((a, b) => b.balanceCents - a.balanceCents);

  const transfers: SettlementTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(
      Math.abs(debtor.balanceCents),
      Math.abs(creditor.balanceCents)
    );

    if (amount <= 0) {
      if (Math.abs(debtor.balanceCents) === 0) {
        debtorIndex += 1;
      }
      if (Math.abs(creditor.balanceCents) === 0) {
        creditorIndex += 1;
      }
      continue;
    }

    transfers.push({
      fromParticipantId: debtor.participantId,
      toParticipantId: creditor.participantId,
      amountCents: amount,
      fromName: debtor.name,
      toName: creditor.name,
    });

    debtor.balanceCents += amount;
    creditor.balanceCents -= amount;

    if (debtor.balanceCents === 0) {
      debtorIndex += 1;
    }
    if (creditor.balanceCents === 0) {
      creditorIndex += 1;
    }
  }

  return transfers;
}

export function calculateExpenseShares(
  expense: ExpenseWithDetails
): ExpenseShareBreakdown[] {
  const shareMap = splitExpense(expense.amountCents, expense.participants);

  return expense.participants.map((participant) => ({
    participantId: participant.participantId,
    name: participant.participant.name,
    amountCents: shareMap.get(participant.participantId) ?? 0,
  }));
}
