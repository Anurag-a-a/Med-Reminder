"use client"

interface MessageAlertProps {
  message: { type: "success" | "error"; text: string } | null
  onClear: () => void
}

export function MessageAlert({ message, onClear }: MessageAlertProps) {
  if (!message) return null

  return (
    <div
      className={`mb-6 p-4 rounded-lg text-center font-medium ${
        message.type === "success"
          ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      }`}
      role="alert"
      aria-live="polite"
    >
      {message.text}
    </div>
  )
}
