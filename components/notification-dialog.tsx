"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Info } from "lucide-react"

interface NotificationDialogProps {
  isOpen: boolean
  onAllow: () => void
  onCancel: () => void
}

export function NotificationDialog({ isOpen, onAllow, onCancel }: NotificationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Enable Notifications</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Allow Pill Reminder to send you notifications so you never miss a dose. You can change this setting anytime
            in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">What you'll get:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Timely reminders when it's time to take your medication</li>
                  <li>Notifications work even when the app is closed</li>
                  <li>Snooze reminders if you need a few more minutes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onAllow}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Allow Notifications
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Not Now
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            You can enable notifications later by clicking the notification status in the header.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
