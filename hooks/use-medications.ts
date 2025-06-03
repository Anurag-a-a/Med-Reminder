"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Medication } from "@/types/medication"

interface Message {
  type: "success" | "error"
  text: string
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [message, setMessage] = useState<Message | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [scheduledNotifications, setScheduledNotifications] = useState<{ [key: string]: number[] }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load medications from localStorage on initial render
  useEffect(() => {
    const savedMedications = localStorage.getItem("medications")
    if (savedMedications) {
      try {
        const parsedMedications = JSON.parse(savedMedications, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "lastTaken" || key === "snoozedUntil") {
            return value ? new Date(value) : undefined
          }
          return value
        })
        setMedications(parsedMedications)
      } catch (error) {
        console.error("Error loading medications from localStorage:", error)
      }
    }
  }, [])

  // Save medications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications))
  }, [medications])

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const validateMedication = (data: Omit<Medication, "id" | "notificationsEnabled">) => {
    const newErrors: { [key: string]: string } = {}

    if (!data.name.trim()) {
      newErrors.name = "Medication name is required"
    }
    if (!data.dosage.trim()) {
      newErrors.dosage = "Dosage is required"
    }
    if (data.frequency < 1 || data.frequency > 10) {
      newErrors.frequency = "Frequency must be between 1 and 10"
    }
    if (!data.firstReminderTime) {
      newErrors.firstReminderTime = "First reminder time is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const scheduleNotifications = (medication: Medication) => {
    if (!medication.notificationsEnabled || Notification.permission !== "granted") {
      return
    }

    // Clear existing notifications for this medication
    if (scheduledNotifications[medication.id]) {
      scheduledNotifications[medication.id].forEach((timeoutId) => clearTimeout(timeoutId))
    }

    const timeouts: number[] = []
    const now = new Date()

    // If medication is snoozed, schedule for snooze time
    if (medication.snoozedUntil && medication.snoozedUntil > now) {
      const timeUntilSnooze = medication.snoozedUntil.getTime() - now.getTime()
      const timeoutId = window.setTimeout(() => {
        new Notification(`💊 Snooze reminder: ${medication.name}`, {
          body: `Time to take your ${medication.dosage} dose`,
          icon: "/pill-icon.png",
          badge: "/pill-badge.png",
          tag: medication.id,
          requireInteraction: true,
        })
      }, timeUntilSnooze)
      timeouts.push(timeoutId)
    } else {
      // Schedule regular notifications
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const [hours, minutes] = medication.firstReminderTime.split(":").map(Number)
      const firstTime = new Date(today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000)

      // Schedule for next 24 hours
      for (let day = 0; day < 2; day++) {
        for (let i = 0; i < medication.frequency; i++) {
          const reminderTime = new Date(
            firstTime.getTime() + day * 24 * 60 * 60 * 1000 + (i * (24 * 60 * 60 * 1000)) / medication.frequency,
          )

          if (reminderTime > now) {
            const timeUntilReminder = reminderTime.getTime() - now.getTime()

            const timeoutId = window.setTimeout(() => {
              new Notification(`💊 Time for ${medication.name}`, {
                body: `Take your ${medication.dosage} dose now`,
                icon: "/pill-icon.png",
                badge: "/pill-badge.png",
                tag: medication.id,
                requireInteraction: true,
              })
            }, timeUntilReminder)

            timeouts.push(timeoutId)
          }
        }
      }
    }

    setScheduledNotifications((prev) => ({
      ...prev,
      [medication.id]: timeouts,
    }))
  }

  const addMedication = (data: Omit<Medication, "id" | "notificationsEnabled">, notificationsEnabled: boolean) => {
    setErrors({})

    if (!validateMedication(data)) {
      setMessage({ type: "error", text: "Please fix the errors below" })
      return false
    }

    try {
      const newMedication: Medication = {
        id: Date.now().toString(),
        name: data.name.trim(),
        dosage: data.dosage.trim(),
        frequency: data.frequency,
        firstReminderTime: data.firstReminderTime,
        notificationsEnabled,
      }

      setMedications((prev) => [...prev, newMedication])
      setMessage({ type: "success", text: "Medication added successfully!" })

      // Schedule notifications if enabled
      if (newMedication.notificationsEnabled) {
        setTimeout(() => scheduleNotifications(newMedication), 100)
      }

      return true
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      return false
    }
  }

  const updateMedication = (id: string, data: Omit<Medication, "id" | "notificationsEnabled">) => {
    setErrors({})

    if (!validateMedication(data)) {
      setMessage({ type: "error", text: "Please fix the errors below" })
      return false
    }

    try {
      setMedications((prev) =>
        prev.map((med) => {
          if (med.id === id) {
            const updated = {
              ...med,
              name: data.name.trim(),
              dosage: data.dosage.trim(),
              frequency: data.frequency,
              firstReminderTime: data.firstReminderTime,
            }

            // Reschedule notifications if enabled
            if (updated.notificationsEnabled) {
              setTimeout(() => scheduleNotifications(updated), 100)
            }

            return updated
          }
          return med
        }),
      )

      setMessage({ type: "success", text: "Medication updated successfully!" })
      return true
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      return false
    }
  }

  const deleteMedication = (id: string) => {
    try {
      // Clear scheduled notifications
      if (scheduledNotifications[id]) {
        scheduledNotifications[id].forEach((timeoutId) => clearTimeout(timeoutId))
        setScheduledNotifications((prev) => {
          const newScheduled = { ...prev }
          delete newScheduled[id]
          return newScheduled
        })
      }

      setMedications((prev) => prev.filter((med) => med.id !== id))
      setMessage({ type: "success", text: "Medication deleted successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete medication. Please try again." })
    }
  }

  const markAsTaken = (id: string) => {
    const now = new Date()
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = {
            ...med,
            lastTaken: now,
            snoozedUntil: undefined, // Clear any snooze when taken
          }

          // Reschedule notifications
          if (updated.notificationsEnabled) {
            setTimeout(() => scheduleNotifications(updated), 100)
          }

          return updated
        }
        return med
      }),
    )

    setMessage({ type: "success", text: "Dose marked as taken!" })
  }

  const snoozeMedication = (id: string) => {
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = { ...med, snoozedUntil: snoozeTime }

          // Reschedule notifications for snooze time
          if (updated.notificationsEnabled) {
            setTimeout(() => scheduleNotifications(updated), 100)
          }

          return updated
        }
        return med
      }),
    )

    setMessage({ type: "success", text: "Reminder snoozed for 10 minutes" })
  }

  const toggleNotifications = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = { ...med, notificationsEnabled: !med.notificationsEnabled }

          // Schedule or clear notifications
          if (updated.notificationsEnabled) {
            setTimeout(() => scheduleNotifications(updated), 100)
          } else {
            // Clear existing notifications
            if (scheduledNotifications[id]) {
              scheduledNotifications[id].forEach((timeoutId) => clearTimeout(timeoutId))
              setScheduledNotifications((prev) => {
                const newScheduled = { ...prev }
                delete newScheduled[id]
                return newScheduled
              })
            }
          }

          return updated
        }
        return med
      }),
    )
  }

  const exportMedications = () => {
    try {
      const dataStr = JSON.stringify(medications, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `pill-reminder-export-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      setMessage({ type: "success", text: "Medications exported successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export medications. Please try again." })
    }
  }

  const importMedications = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedMedications = JSON.parse(content, (key, value) => {
            // Convert date strings back to Date objects
            if (key === "lastTaken" || key === "snoozedUntil") {
              return value ? new Date(value) : undefined
            }
            return value
          })

          if (Array.isArray(importedMedications)) {
            setMedications(importedMedications)
            setMessage({ type: "success", text: "Medications imported successfully!" })
          } else {
            throw new Error("Invalid format")
          }
        } catch (error) {
          setMessage({ type: "error", text: "Invalid file format. Please select a valid export file." })
        }
      }
      reader.readAsText(file)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import medications. Please try again." })
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return {
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
  }
}
