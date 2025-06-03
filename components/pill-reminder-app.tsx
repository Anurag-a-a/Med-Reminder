"use client"
import { useState, useEffect } from "react"
import { Header } from "./header"
import { ActionButtons } from "./action-buttons"
import { MessageAlert } from "./message-alert"
import { MedicationForm } from "./medication-form"
import { MedicationGrid } from "./medication-grid"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { HelpModal } from "./help-modal"
import { NotificationDialog } from "./notification-dialog"
import { useMedications } from "@/hooks/use-medications"
import { useNotifications } from "@/hooks/use-notifications"
import type { Medication } from "@/types/medication"

export function PillReminderApp() {
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)

  const {
    medications,
    message,
    errors,
    addMedication,
    updateMedication,
    deleteMedication,
    markAsTaken,
    snoozeMedication,
    toggleNotifications,
    clearMessage,
    exportMedications,
    importMedications,
  } = useMedications()

  const { notificationPermission, requestNotificationPermission } = useNotifications(medications)

  // Check if user has seen help before
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("hasSeenHelp")
    if (!hasSeenHelp) {
      setShowHelp(true)
      localStorage.setItem("hasSeenHelp", "true")
    }
  }, [])

  const handleAddMedication = (medicationData: Omit<Medication, "id" | "notificationsEnabled">) => {
    const success = addMedication(medicationData, notificationPermission === "granted")
    if (success) {
      setShowForm(false)
      setEditingMedication(null)
    }
  }

  const handleUpdateMedication = (medicationData: Omit<Medication, "id" | "notificationsEnabled">) => {
    if (editingMedication) {
      const success = updateMedication(editingMedication.id, medicationData)
      if (success) {
        setShowForm(false)
        setEditingMedication(null)
      }
    }
  }

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingMedication(null)
    setShowForm(false)
  }

  const handleDeleteMedication = (id: string) => {
    deleteMedication(id)
    setShowDeleteConfirm(null)
  }

  const handleRequestNotificationPermission = async () => {
    await requestNotificationPermission()
    setShowNotificationDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header
          notificationPermission={notificationPermission}
          onShowHelp={() => setShowHelp(true)}
          onShowNotificationDialog={() => setShowNotificationDialog(true)}
        />

        <ActionButtons
          editingMedication={editingMedication}
          showForm={showForm}
          medicationsCount={medications.length}
          onToggleForm={() => {
            if (!showForm) {
              setEditingMedication(null)
            }
            setShowForm(!showForm)
          }}
          onExport={exportMedications}
          onImport={importMedications}
        />

        <MessageAlert message={message} onClear={clearMessage} />

        {showForm && (
          <MedicationForm
            editingMedication={editingMedication}
            errors={errors}
            onSubmit={editingMedication ? handleUpdateMedication : handleAddMedication}
            onCancel={handleCancelEdit}
          />
        )}

        <MedicationGrid
          medications={medications}
          onEdit={handleEditMedication}
          onDelete={(id) => setShowDeleteConfirm(id)}
          onMarkAsTaken={markAsTaken}
          onSnooze={snoozeMedication}
          onToggleNotifications={toggleNotifications}
          notificationPermission={notificationPermission}
        />

        <DeleteConfirmDialog
          isOpen={!!showDeleteConfirm}
          onConfirm={() => showDeleteConfirm && handleDeleteMedication(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />

        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        <NotificationDialog
          isOpen={showNotificationDialog}
          onAllow={handleRequestNotificationPermission}
          onCancel={() => setShowNotificationDialog(false)}
        />
      </div>
    </div>
  )
}
