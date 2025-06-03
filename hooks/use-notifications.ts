"use client"

import { useState, useEffect } from "react"
import type { Medication } from "@/types/medication"

export function useNotifications(medications: Medication[]) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  // Request notification permission on app load
  useEffect(() => {
    const requestNotificationPermissionInitial = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
      }
    }

    requestNotificationPermissionInitial()
    setNotificationPermission(Notification.permission)
  }, [])

  const requestNotificationPermission = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)

        if (permission === "granted") {
          // Re-schedule notifications for all medications that have them enabled
          medications.forEach((med) => {
            if (med.notificationsEnabled) {
              // This would need to be handled by the parent component
              // since we don't have access to the scheduling logic here
            }
          })
        }
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error)
    }
  }

  return {
    notificationPermission,
    requestNotificationPermission,
  }
}
