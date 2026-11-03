// AI-assisted (Claude Code): turns an AuthError from src/data/auth.ts into the translated message the screens show.
import type { AuthError } from "@/data/auth";
import { t } from "@/i18n";

const keys: Record<AuthError, string> = {
  offline: "errors.offline",
  rateLimited: "errors.rateLimited",
  wrongPassword: "auth.existing.wrongPassword",
  emailTaken: "auth.setPassword.emailTaken",
  invalidCode: "auth.reset.invalidCode",
  unknown: "errors.unknown",
};

export function authErrorMessage(error: AuthError): string {
  return t(keys[error]);
}
