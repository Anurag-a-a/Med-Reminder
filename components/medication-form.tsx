"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Medication } from "@/types/medication"

interface MedicationFormProps {
  editingMedication: Medication | null
  errors: { [key: string]: string }
  onSubmit: (data: Omit<Medication, "id" | "notificationsEnabled">) => void
  onCancel: () => void
}

export function MedicationForm({ editingMedication, errors, onSubmit, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: 1,
    firstReminderTime: "",
  })

  useEffect(() => {
    if (editingMedication) {
      setFormData({
        name: editingMedication.name,
        dosage: editingMedication.dosage,
        frequency: editingMedication.frequency,
        firstReminderTime: editingMedication.firstReminderTime,
      })
    } else {
      setFormData({
        name: "",
        dosage: "",
        frequency: 1,
        firstReminderTime: "",
      })
    }
  }, [editingMedication])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {editingMedication ? "Edit Medication" : "Add New Medication"}
        </CardTitle>
        <CardDescription className="text-blue-100 dark:text-blue-200">
          {editingMedication ? "Update your medication details below" : "Enter your medication details below"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-medium">
                Medication Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Aspirin"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 ${
                  errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                required
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm" id="name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage" className="text-gray-700 dark:text-gray-200 font-medium">
                Dosage *
              </Label>
              <Input
                id="dosage"
                type="text"
                placeholder="e.g., 100mg"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                className={`border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 ${
                  errors.dosage ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                required
                aria-invalid={errors.dosage ? "true" : "false"}
                aria-describedby={errors.dosage ? "dosage-error" : undefined}
              />
              {errors.dosage && (
                <p className="text-red-600 dark:text-red-400 text-sm" id="dosage-error">
                  {errors.dosage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-gray-700 dark:text-gray-200 font-medium">
                Times per Day *
              </Label>
              <Select
                value={formData.frequency.toString()}
                onValueChange={(value) => handleInputChange("frequency", Number.parseInt(value))}
              >
                <SelectTrigger
                  id="frequency"
                  className={`border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 ${
                    errors.frequency ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-invalid={errors.frequency ? "true" : "false"}
                  aria-describedby={errors.frequency ? "frequency-error" : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="1">Once daily</SelectItem>
                  <SelectItem value="2">Twice daily</SelectItem>
                  <SelectItem value="3">Three times daily</SelectItem>
                  <SelectItem value="4">Four times daily</SelectItem>
                  <SelectItem value="5">Five times daily</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-red-600 dark:text-red-400 text-sm" id="frequency-error">
                  {errors.frequency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-700 dark:text-gray-200 font-medium">
                First Reminder Time *
              </Label>
              <Select
                value={formData.firstReminderTime}
                onValueChange={(value) => handleInputChange("firstReminderTime", value)}
              >
                <SelectTrigger
                  id="time"
                  className={`border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 ${
                    errors.firstReminderTime ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-invalid={errors.firstReminderTime ? "true" : "false"}
                  aria-describedby={errors.firstReminderTime ? "time-error" : undefined}
                >
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-60 overflow-y-auto">
                  {Array.from({ length: 24 }, (_, hour) =>
                    Array.from({ length: 4 }, (_, quarter) => {
                      const minutes = quarter * 15
                      const timeValue = `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                      const ampm = hour < 12 ? "AM" : "PM"
                      const displayTime = `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`

                      return (
                        <SelectItem key={timeValue} value={timeValue}>
                          {displayTime}
                        </SelectItem>
                      )
                    }),
                  ).flat()}
                </SelectContent>
              </Select>
              {errors.firstReminderTime && (
                <p className="text-red-600 dark:text-red-400 text-sm" id="time-error">
                  {errors.firstReminderTime}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex-1"
            >
              {editingMedication ? "Update Medication" : "Add Medication"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
