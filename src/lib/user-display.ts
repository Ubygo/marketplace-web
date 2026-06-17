import type { User } from "@/types/auth";

export function getUserInitials(user: User | null | undefined): string {
  if (!user) {
    return "?";
  }

  const first = user.firstName?.trim().charAt(0) ?? "";
  const last = user.lastName?.trim().charAt(0) ?? "";

  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }

  if (first) {
    return first.toUpperCase();
  }

  if (last) {
    return last.toUpperCase();
  }

  const emailPrefix = user.email?.trim().slice(0, 2);
  if (emailPrefix) {
    return emailPrefix.toUpperCase();
  }

  return "?";
}

export function getUserFullName(user: User | null | undefined): string {
  if (!user) {
    return "";
  }

  const fullName = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user.email || "";
}
