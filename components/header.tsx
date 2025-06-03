"use client"

import { Button } from "@/components/ui/button"
import { Pill, HelpCircle, Sun, Moon, CheckCircle, AlertCircle, Bell } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface HeaderProps {
  notificationPermission: NotificationPermission
  onShowHelp: () => void
  onShowNotificationDialog: () => void
}

export function Header({ notificationPermission, onShowHelp, onShowNotificationDialog }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getNotificationStatusIcon = () => {
    switch (notificationPermission) {
      case "granted":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "denied":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    }
  }

  const getNotificationStatusText = () => {
    switch (notificationPermission) {
      case "granted":
        return "Notifications enabled"
      case "denied":
        return "Notifications blocked"
      default:
        return "Notifications pending"
    }
  }

  return (
    <div className="text-center mb-8 relative">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
          <Pill className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-400">
            Pill Reminder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Stay healthy, stay on track</p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        className="absolute top-0 right-0 rounded-full"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Help Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onShowHelp}
        className="absolute top-0 left-0 rounded-full"
        aria-label="Show help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Notification Permission Status */}
      <div
        className={`flex items-center justify-center gap-2 mt-4 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-sm ${
          notificationPermission === "denied"
            ? "cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
            : ""
        }`}
        onClick={notificationPermission === "denied" ? onShowNotificationDialog : undefined}
        role={notificationPermission === "denied" ? "button" : undefined}
        tabIndex={notificationPermission === "denied" ? 0 : undefined}
        onKeyDown={
          notificationPermission === "denied"
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onShowNotificationDialog()
                }
              }
            : undefined
        }
        aria-label={notificationPermission === "denied" ? "Click to enable notifications" : undefined}
      >
        {getNotificationStatusIcon()}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{getNotificationStatusText()}</span>
        {notificationPermission === "denied" && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onShowNotificationDialog()
            }}
            className="ml-2 text-xs"
          >
            Enable
          </Button>
        )}
      </div>
    </div>
  )
}
