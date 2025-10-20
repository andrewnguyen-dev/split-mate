import { z } from "zod";

const cuidSchema = z.string().min(10);

export const tripCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Trip name is required")
    .max(80, "Trip name is too long"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code"),
  participants: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "Participant name is required")
          .max(80, "Participant name is too long"),
        weight: z
          .union([z.string(), z.number()])
          .transform((val) => Number(val))
          .pipe(
            z
              .number()
              .int("Weight must be a whole number")
              .min(1, "Weight must be at least 1")
              .max(99, "Weight must be 99 or less")
          ),
      })
    )
    .min(1, "Add at least one participant"),
});

export type TripCreateInput = z.infer<typeof tripCreateSchema>;

export const participantUpsertSchema = z.object({
  tripId: cuidSchema,
  participantId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .int("Weight must be a whole number")
        .min(1, "Weight must be at least 1")
        .max(99, "Weight must be 99 or less")
    ),
});

export type ParticipantUpsertInput = z.infer<typeof participantUpsertSchema>;

export const moneyInputSchema = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .transform((value) => value.replace(/,/g, ""))
  .refine(
    (value) => /^\d+(\.\d{0,2})?$/.test(value),
    "Enter a valid amount (up to 2 decimal places)"
  )
  .transform((value) => Math.round(parseFloat(value) * 100))
  .refine((value) => value > 0, "Amount must be greater than zero");

export const expenseCreateSchema = z.object({
  tripId: cuidSchema,
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(120, "Keep descriptions under 120 characters"),
  amountCents: moneyInputSchema,
  payerId: cuidSchema,
  participantIds: z.array(cuidSchema).min(1, "Select at least one participant"),
  date: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : new Date())),
});

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;

export const tripIdSchema = cuidSchema;
