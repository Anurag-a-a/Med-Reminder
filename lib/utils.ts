import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Medication } from "@/types/medication"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDateTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return date.toLocaleDateString() + " " + formatTime(date.toTimeString().slice(0, 5))
  }
}

export function calculateNextReminder(medication: Medication) {
  const now = new Date()

  // If snoozed, return snooze time
  if (medication.snoozedUntil && medication.snoozedUntil > now) {
    return medication.snoozedUntil
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [hours, minutes] = medication.firstReminderTime.split(":").map(Number)
  const firstTime = new Date(today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000)

  // Calculate all reminder times for today
  const reminderTimes = []
  for (let i = 0; i < medication.frequency; i++) {
    const reminderTime = new Date(firstTime.getTime() + (i * (24 * 60 * 60 * 1000)) / medication.frequency)
    reminderTimes.push(reminderTime)
  }

  // Find next upcoming reminder
  const upcomingReminders = reminderTimes.filter((time) => time > now)

  if (upcomingReminders.length > 0) {
    return upcomingReminders[0]
  } else {
    // All reminders for today have passed, show tomorrow's first reminder
    return new Date(firstTime.getTime() + 24 * 60 * 60 * 1000)
  }
}

export function isOverdue(medication: Medication) {
  const now = new Date()

  // If snoozed, not overdue
  if (medication.snoozedUntil && medication.snoozedUntil > now) {
    return false
  }

  // Check if current time is past the most recent scheduled dose
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [hours, minutes] = medication.firstReminderTime.split(":").map(Number)
  const firstTime = new Date(today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000)

  const reminderTimes = []
  for (let i = 0; i < medication.frequency; i++) {
    const reminderTime = new Date(firstTime.getTime() + (i * (24 * 60 * 60 * 1000)) / medication.frequency)
    reminderTimes.push(reminderTime)
  }

  // Find the most recent scheduled dose that has passed
  const passedReminders = reminderTimes.filter((time) => time <= now)

  if (passedReminders.length === 0) return false

  const mostRecentScheduled = passedReminders[passedReminders.length - 1]

  // If no dose has been taken, or last taken was before the most recent scheduled dose
  if (!medication.lastTaken || medication.lastTaken < mostRecentScheduled) {
    // Consider overdue if more than 30 minutes past scheduled time
    return now.getTime() - mostRecentScheduled.getTime() > 30 * 60 * 1000
  }

  return false
}

export function formatNextReminder(nextReminder: Date, medication: Medication) {
  const now = new Date()
  const diffMs = nextReminder.getTime() - now.getTime()
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.ceil(diffMs / (1000 * 60))

  // If snoozed, show snooze indicator
  if (medication.snoozedUntil && medication.snoozedUntil > now) {
    return `Snoozed ${diffMinutes}m`
  }

  if (diffMinutes <= 60) {
    return diffMinutes <= 1 ? "Due now" : `${diffMinutes}m`
  } else if (diffHours <= 24) {
    return `${diffHours}h`
  } else {
    return nextReminder.toLocaleDateString() + " " + formatTime(nextReminder.toTimeString().slice(0, 5))
  }
}
