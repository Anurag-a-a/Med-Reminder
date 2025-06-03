"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { MedicationCard } from "./medication-card"
import type { Medication } from "@/types/medication"

interface MedicationGridProps {
  medications: Medication[]
  onEdit: (medication: Medication) => void
  onDelete: (id: string) => void
  onMarkAsTaken: (id: string) => void
  onSnooze: (id: string) => void
  onToggleNotifications: (id: string) => void
  notificationPermission: NotificationPermission
}

export function MedicationGrid({
  medications,
  onEdit,
  onDelete,
  onMarkAsTaken,
  onSnooze,
  onToggleNotifications,
  notificationPermission,
}: MedicationGridProps) {
  if (medications.length === 0) {
    return (
      <Card className="text-center py-16 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full shadow-inner">
              <Plus className="h-16 w-16 text-gray-400 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">No medications yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6 max-w-md">
                Start building your medication routine by adding your first pill reminder
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Click "Add New Medication" above to begin</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {medications.map((medication) => (
        <MedicationCard
          key={medication.id}
          medication={medication}
          onEdit={() => onEdit(medication)}
          onDelete={() => onDelete(medication.id)}
          onMarkAsTaken={() => onMarkAsTaken(medication.id)}
          onSnooze={() => onSnooze(medication.id)}
          onToggleNotifications={() => onToggleNotifications(medication.id)}
          notificationPermission={notificationPermission}
        />
      ))}
    </div>
  )
}
