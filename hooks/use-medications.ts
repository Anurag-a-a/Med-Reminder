"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

  // Helper function to escape CSV values
  const escapeCSVValue = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return ""
    const stringValue = String(value)
    // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Helper function to parse CSV line
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current)
        current = ""
        i++
      } else {
        current += char
        i++
      }
    }

    // Add the last field
    result.push(current)
    return result
  }

  // Safari-specific download function
  const downloadForSafari = (content: string, filename: string) => {
    try {
      // Method 1: Try using data URL (works best in Safari)
      const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(content)

      // Create a temporary link
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = filename
      link.style.display = "none"

      // Add to DOM
      document.body.appendChild(link)

      // Trigger download with user interaction simulation
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      })

      link.dispatchEvent(clickEvent)

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

      return true
    } catch (error) {
      console.error("Safari download method 1 failed:", error)
      return false
    }
  }

  // Safari fallback method
  const safariFallbackDownload = (content: string, filename: string) => {
    try {
      // Create blob and object URL
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      // Open in new tab for Safari
      const newWindow = window.open(url, "_blank")

      if (newWindow) {
        // Set a timeout to revoke the URL
        setTimeout(() => {
          URL.revokeObjectURL(url)
          newWindow.close()
        }, 1000)
        return true
      }

      return false
    } catch (error) {
      console.error("Safari fallback method failed:", error)
      return false
    }
  }

  // Safari manual download method
  const safariManualDownload = (content: string, filename: string) => {
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Download ${filename}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 20px; 
                background: #f5f5f7;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e5e7;
              }
              .instructions {
                background: #007AFF;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                line-height: 1.6;
              }
              .csv-content {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e5e5e7;
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 12px;
                white-space: pre-wrap;
                word-break: break-all;
                max-height: 400px;
                overflow-y: auto;
              }
              .download-btn {
                background: #007AFF;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px 5px;
                transition: background 0.2s;
              }
              .download-btn:hover {
                background: #0056CC;
              }
              .copy-btn {
                background: #34C759;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px 5px;
                transition: background 0.2s;
              }
              .copy-btn:hover {
                background: #28A745;
              }
              .step {
                margin: 15px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #007AFF;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💊 Pill Reminder Export</h1>
                <p>Your medication data is ready for download</p>
              </div>
              
              <div class="instructions">
                <h3>📥 Safari Download Instructions:</h3>
                <div class="step">
                  <strong>Step 1:</strong> Click the "Copy CSV Data" button below to copy the data to your clipboard
                </div>
                <div class="step">
                  <strong>Step 2:</strong> Open TextEdit or any text editor on your Mac
                </div>
                <div class="step">
                  <strong>Step 3:</strong> Paste the data (Cmd+V) into the text editor
                </div>
                <div class="step">
                  <strong>Step 4:</strong> Save the file with the name "${filename}" (make sure to include .csv extension)
                </div>
                <div class="step">
                  <strong>Step 5:</strong> You can now open this file in Excel or Numbers
                </div>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <button class="copy-btn" onclick="copyToClipboard()">📋 Copy CSV Data</button>
                <button class="download-btn" onclick="downloadFile()">💾 Try Download</button>
              </div>

              <h3>📄 CSV Content:</h3>
              <div class="csv-content" id="csvContent">${content}</div>
            </div>

            <script>
              function copyToClipboard() {
                const csvContent = document.getElementById('csvContent').textContent;
                navigator.clipboard.writeText(csvContent).then(function() {
                  alert('✅ CSV data copied to clipboard! Now paste it into TextEdit and save as ${filename}');
                }).catch(function(err) {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = csvContent;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('✅ CSV data copied to clipboard! Now paste it into TextEdit and save as ${filename}');
                });
              }

              function downloadFile() {
                const csvContent = document.getElementById('csvContent').textContent;
                const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = '${filename}';
                link.click();
              }
            </script>
          </body>
        </html>
      `)
      newWindow.document.close()
      return true
    }
    return false
  }

  const exportMedications = () => {
    try {
      if (medications.length === 0) {
        setMessage({ type: "error", text: "No medications to export" })
        return
      }

      // CSV Headers
      const headers = [
        "Medication Name",
        "Dosage",
        "Frequency (times per day)",
        "First Reminder Time",
        "Notifications Enabled",
        "Last Taken",
        "Snoozed Until",
        "Export Date",
      ]

      // Convert medications to CSV rows
      const csvRows = medications.map((med) => [
        escapeCSVValue(med.name),
        escapeCSVValue(med.dosage),
        escapeCSVValue(med.frequency),
        escapeCSVValue(med.firstReminderTime),
        escapeCSVValue(med.notificationsEnabled ? "Yes" : "No"),
        escapeCSVValue(med.lastTaken ? med.lastTaken.toISOString() : ""),
        escapeCSVValue(med.snoozedUntil ? med.snoozedUntil.toISOString() : ""),
        escapeCSVValue(new Date().toISOString()),
      ])

      // Combine headers and rows
      const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

      // Add BOM for Excel compatibility
      const BOM = "\uFEFF"
      const finalContent = BOM + csvContent

      const exportFileName = `pill-reminder-medications-${new Date().toISOString().slice(0, 10)}.csv`

      // Detect Safari
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

      if (isSafari) {
        // Safari-specific download sequence
        let downloadSuccess = false

        // Try method 1: Data URL download
        downloadSuccess = downloadForSafari(finalContent, exportFileName)

        if (!downloadSuccess) {
          // Try method 2: Blob URL in new tab
          downloadSuccess = safariFallbackDownload(finalContent, exportFileName)
        }

        if (!downloadSuccess) {
          // Method 3: Manual download page
          downloadSuccess = safariManualDownload(finalContent, exportFileName)
        }

        if (downloadSuccess) {
          setMessage({
            type: "success",
            text: `Export ready! If download didn't start automatically, follow the instructions in the new tab.`,
          })
        } else {
          setMessage({ type: "error", text: "Export failed. Please try again." })
        }
      } else {
        // Standard download for non-Safari browsers
        const blob = new Blob([finalContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = exportFileName
        link.style.display = "none"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => URL.revokeObjectURL(url), 100)
        setMessage({ type: "success", text: `Exported ${medications.length} medications to CSV successfully!` })
      }
    } catch (error) {
      console.error("Export error:", error)
      setMessage({ type: "error", text: "Failed to export medications. Please try again." })
    }
  }

  const importMedications = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "csv") {
      setMessage({ type: "error", text: "Please select a CSV file." })
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split("\n").filter((line) => line.trim() !== "")

        if (lines.length < 2) {
          throw new Error("CSV file must contain headers and at least one medication")
        }

        // Parse headers
        const headers = parseCSVLine(lines[0])
        const expectedHeaders = [
          "Medication Name",
          "Dosage",
          "Frequency (times per day)",
          "First Reminder Time",
          "Notifications Enabled",
          "Last Taken",
          "Snoozed Until",
          "Export Date",
        ]

        // Validate headers (check if at least the first 4 required headers exist)
        const requiredHeaders = expectedHeaders.slice(0, 4)
        const hasRequiredHeaders = requiredHeaders.every((header) => headers.includes(header))

        if (!hasRequiredHeaders) {
          throw new Error(
            "Invalid CSV format. Required columns: Medication Name, Dosage, Frequency (times per day), First Reminder Time",
          )
        }

        // Parse medication data
        const importedMedications: Medication[] = []
        const errors: string[] = []

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i])
            if (values.length < 4) continue // Skip incomplete rows

            const nameIndex = headers.indexOf("Medication Name")
            const dosageIndex = headers.indexOf("Dosage")
            const frequencyIndex = headers.indexOf("Frequency (times per day)")
            const timeIndex = headers.indexOf("First Reminder Time")
            const notificationsIndex = headers.indexOf("Notifications Enabled")
            const lastTakenIndex = headers.indexOf("Last Taken")
            const snoozedIndex = headers.indexOf("Snoozed Until")

            const name = values[nameIndex]?.trim()
            const dosage = values[dosageIndex]?.trim()
            const frequency = Number.parseInt(values[frequencyIndex]?.trim() || "1")
            const firstReminderTime = values[timeIndex]?.trim()

            // Validate required fields
            if (!name || !dosage || !firstReminderTime) {
              errors.push(`Row ${i + 1}: Missing required fields`)
              continue
            }

            // Validate frequency
            if (isNaN(frequency) || frequency < 1 || frequency > 10) {
              errors.push(`Row ${i + 1}: Invalid frequency (must be 1-10)`)
              continue
            }

            // Validate time format
            if (!/^\d{1,2}:\d{2}$/.test(firstReminderTime)) {
              errors.push(`Row ${i + 1}: Invalid time format (use HH:MM)`)
              continue
            }

            const medication: Medication = {
              id: `imported-${Date.now()}-${i}`,
              name,
              dosage,
              frequency,
              firstReminderTime,
              notificationsEnabled:
                notificationsIndex >= 0 ? values[notificationsIndex]?.toLowerCase() === "yes" : false,
              lastTaken: lastTakenIndex >= 0 && values[lastTakenIndex] ? new Date(values[lastTakenIndex]) : undefined,
              snoozedUntil: snoozedIndex >= 0 && values[snoozedIndex] ? new Date(values[snoozedIndex]) : undefined,
            }

            importedMedications.push(medication)
          } catch (rowError) {
            errors.push(`Row ${i + 1}: ${rowError}`)
          }
        }

        if (importedMedications.length === 0) {
          throw new Error("No valid medications found in the CSV file")
        }

        // Replace current medications with imported ones
        setMedications(importedMedications)

        let successMessage = `Successfully imported ${importedMedications.length} medications!`
        if (errors.length > 0) {
          successMessage += ` (${errors.length} rows had errors and were skipped)`
          console.warn("Import errors:", errors)
        }

        setMessage({ type: "success", text: successMessage })
      } catch (error) {
        console.error("Import error:", error)
        setMessage({
          type: "error",
          text: `Import failed: ${error instanceof Error ? error.message : "Invalid file format"}`,
        })
      }
    }

    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read the file. Please try again." })
    }

    reader.readAsText(file)

    // Reset the file input
    event.target.value = ""
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
