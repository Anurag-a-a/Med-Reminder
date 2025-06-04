"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Info, Bell, Check, AlertCircle, Download } from "lucide-react"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="text-center sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700">
          <div className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" aria-label="Close help">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Med-Reminder App Help</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Learn how to use the Med-Reminder app to manage your medications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Getting Started</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The Med-Reminder app helps you keep track of your medications and reminds you when it's time to take them.
              Here's how to use it:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">Add medications</span> by clicking the
                "Add New Medication" button and filling out the form.
              </li>
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">Enable notifications</span> when prompted
                to receive reminders when it's time to take your medication.
              </li>
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">Mark doses as taken</span> by clicking
                the "Take Now" button when you take your medication.
              </li>
              <li>
                <span className="font-medium text-gray-700 dark:text-gray-300">Snooze reminders</span> if you need to be
                reminded again in 10 minutes.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Notifications</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive browser notifications when it's time to take your medication, even when the app is closed.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Dose Tracking</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep track of when you last took each medication and see upcoming doses.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Overdue Alerts</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Medications that are overdue are highlighted in red so you don't miss a dose.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Export/Import</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Backup your medication list by exporting it, and restore it later by importing.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tips</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                Your medications are saved automatically in your browser, so they'll still be there when you come back.
              </li>
              <li>Use the dark mode toggle in the top right corner to switch between light and dark themes.</li>
              <li>Export your medication list regularly as a backup in case you clear your browser data.</li>
              <li>
                For medications that need to be taken with food, consider setting the reminder time to coincide with
                meals.
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Got it!
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
