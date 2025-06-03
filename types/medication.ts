export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: number
  firstReminderTime: string
  notificationsEnabled: boolean
  lastTaken?: Date
  snoozedUntil?: Date
}
