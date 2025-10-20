import { ZodError } from "zod";

export type ActionErrorBag = Record<string, string>;

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  errors?: ActionErrorBag;
  message?: string;
}

export const mapZodErrors = (error: unknown): ActionErrorBag => {
  if (!(error instanceof ZodError)) {
    return {};
  }

  const { fieldErrors, formErrors } = error.flatten();
  const fieldErrorEntries = fieldErrors as Record<string, string[]>;
  const formErrorMessages = formErrors as string[];
  const bag: ActionErrorBag = {};

  Object.entries(fieldErrorEntries || {}).forEach(([key, messages]) => {
    if (!messages || messages.length === 0) return;
    const normalizedKey = key.split(".")[0] ?? key;
    if (!bag[normalizedKey]) {
      bag[normalizedKey] = String(messages[0]);
    }
  });

  if (formErrorMessages && formErrorMessages.length) {
    bag["form"] = String(formErrorMessages[0]);
  }

  return bag;
};

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T>(
  errors: ActionErrorBag,
  message?: string
): ActionResult<T> {
  return { ok: false, errors, message };
}
