import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Activity, Participant } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The amount a single participant owes for an activity.
 * Honours per-person `shareAmount` (set by percentage/exact splits) and
 * falls back to the equal-split `amountPerPerson` for older/equal records.
 */
export function shareOf(activity: Activity, participant: Participant): number {
  return participant.shareAmount ?? activity.amountPerPerson
}
