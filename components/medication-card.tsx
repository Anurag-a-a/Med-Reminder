"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Pill,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Bell,
  BellOff,
  AlertCircle,
  Check,
  AlarmClockIcon as Snooze,
} from "lucide-react"
import { formatTime, formatDateTime, calculateNextReminder, isOverdue, formatNextReminder } from "@/lib/utils"
import type { Medication } from "@/types/medication"

interface MedicationCardProps {
  medication: Medication
  onEdit: () => void
  onDelete: () => void
  onMarkAsTaken: () => void
  onSnooze: () => void
  onToggleNotifications: () => void
  notificationPermission: NotificationPermission
}

export function MedicationCard({
  medication,
  onEdit,
  onDelete,
  onMarkAsTaken,
  onSnooze,
  onToggleNotifications,
  notificationPermission,
}: MedicationCardProps) {
  const nextReminder = calculateNextReminder(medication)
  const overdueStatus = isOverdue(medication)
  const isSnoozed = medication.snoozedUntil && medication.snoozedUntil > new Date()

  return (
    <Card
      className={`shadow-xl border-0 bg-white dark:bg-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group ${
        overdueStatus ? "ring-2 ring-red-400 dark:ring-red-500" : ""
      }`}
    >
      <CardHeader
        className={`${
          overdueStatus
            ? "bg-gradient-to-br from-red-500 via-red-600 to-orange-500"
            : isSnoozed
              ? "bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500"
              : "bg-gradient-to-br from-blue-500 via-blue-600 to-green-500"
        } text-white relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardTitle className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{medication.name}</h3>
              <p className="text-blue-100 text-sm font-normal">{medication.dosage}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full relative z-10"
              title="Edit medication"
              aria-label={`Edit ${medication.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-white hover:bg-red-500/20 h-8 w-8 p-0 rounded-full relative z-10"
              title="Delete medication"
              aria-label={`Delete ${medication.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Next Reminder Timing */}
        <div
          className={`p-4 rounded-xl border ${
            overdueStatus
              ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : isSnoozed
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                : "bg-gradient-to-r from-green-50 to-blue-50 border-green-100 dark:bg-green-900/20 dark:border-green-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  overdueStatus ? "bg-red-500" : isSnoozed ? "bg-yellow-500" : "bg-green-500"
                }`}
              >
                {overdueStatus ? (
                  <AlertCircle className="h-4 w-4 text-white" />
                ) : isSnoozed ? (
                  <Snooze className="h-4 w-4 text-white" />
                ) : (
                  <Clock className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {overdueStatus ? "Overdue" : isSnoozed ? "Snoozed" : "Next Reminder"}
                </p>
                <p
                  className={`font-bold text-lg ${
                    overdueStatus
                      ? "text-red-700 dark:text-red-400"
                      : isSnoozed
                        ? "text-yellow-700 dark:text-yellow-400"
                        : "text-green-700 dark:text-green-400"
                  }`}
                >
                  {formatNextReminder(nextReminder, medication)}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(nextReminder.toTimeString().slice(0, 5))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onMarkAsTaken}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
            size="sm"
            aria-label={`Mark ${medication.name} as taken`}
          >
            <Check className="h-4 w-4 mr-2" />
            Take Now
          </Button>
          <Button
            onClick={onSnooze}
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            size="sm"
            aria-label={`Snooze ${medication.name} reminder for 10 minutes`}
          >
            <Snooze className="h-4 w-4 mr-2" />
            Snooze 10m
          </Button>
        </div>

        {/* Last Taken */}
        {medication.lastTaken && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Last Taken</p>
              <p className="font-semibold text-green-700 dark:text-green-400">{formatDateTime(medication.lastTaken)}</p>
            </div>
          </div>
        )}

        {/* Notification Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              {medication.notificationsEnabled ? (
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {medication.notificationsEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
          <Switch
            checked={medication.notificationsEnabled}
            onCheckedChange={onToggleNotifications}
            disabled={notificationPermission !== "granted"}
            aria-label={`${medication.notificationsEnabled ? "Disable" : "Enable"} notifications for ${
              medication.name
            }`}
          />
        </div>

        {/* Medication Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Daily Frequency</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {medication.frequency} time{medication.frequency > 1 ? "s" : ""} per day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">First Daily Dose</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {formatTime(medication.firstReminderTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                overdueStatus
                  ? "bg-red-500 animate-pulse"
                  : medication.notificationsEnabled
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-400"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                overdueStatus
                  ? "text-red-600 dark:text-red-400"
                  : medication.notificationsEnabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {overdueStatus ? "Overdue" : medication.notificationsEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
            {medication.frequency}x daily
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
