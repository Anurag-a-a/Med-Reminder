"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot, User, Loader2, Pill, X, Plus, Minimize2, Maximize2, Trash2, AlertCircle } from "lucide-react"
import type { Medication } from "@/types/medication"
import { calculateNextReminder, isOverdue } from "@/lib/utils"

interface ChatMessage {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  medicationSuggestion?: {
    name: string
    dosage: string
    frequency: number
    firstReminderTime: string
  }
}

interface MedicationChatbotProps {
  medications: Medication[]
  isOpen: boolean
  onClose: () => void
  onAddMedication: (data: Omit<Medication, "id" | "notificationsEnabled">) => void
}

export function MedicationChatbot({ medications, isOpen, onClose, onAddMedication }: MedicationChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load message history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatbot-messages")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages, (key, value) => {
          if (key === "timestamp") {
            return new Date(value)
          }
          return value
        })
        setMessages(parsedMessages)
      } catch (error) {
        console.error("Error loading chat history:", error)
        setMessages([getWelcomeMessage()])
      }
    } else {
      setMessages([getWelcomeMessage()])
    }
  }, [])

  // Save message history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatbot-messages", JSON.stringify(messages))
    }
  }, [messages])

  const getWelcomeMessage = (): ChatMessage => ({
    id: "welcome",
    type: "bot",
    content:
      "Hello! I'm your AI medication assistant. I can help you with:\n\n• Information about your current medications\n• Adding new medications to your schedule\n• Drug interactions and side effects\n• Daily medication schedules\n• General health questions\n\nWhat would you like to know?",
    timestamp: new Date(),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getTodaysMedications = () => {
    const today = new Date()
    const todaysMeds = medications.map((med) => {
      const nextReminder = calculateNextReminder(med)
      const isToday = nextReminder.toDateString() === today.toDateString()
      const overdueStatus = isOverdue(med)

      return {
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        firstReminderTime: med.firstReminderTime,
        nextReminder: nextReminder,
        isToday,
        isOverdue: overdueStatus,
        lastTaken: med.lastTaken,
      }
    })

    return todaysMeds.filter((med) => med.isToday || med.isOverdue)
  }

  const extractMedicationFromResponse = (response: string) => {
    // Improved regex patterns to extract medication details from AI response

    // Try to find structured format first (Medication: X, Dosage: Y)
    const nameMatch =
      response.match(/medication:?\s*([A-Za-z0-9\s-]+?)(?:\s*,|\s*\.|\s*\n|$)/i) ||
      response.match(/add\s+([A-Za-z0-9\s-]+?)\s+(\d+\s*mg|\d+\s*ml|\d+\s*tablets?)/i)

    const dosageMatch =
      response.match(/dosage:?\s*(\d+\s*mg|\d+\s*ml|\d+\s*tablets?)/i) ||
      response.match(/(\d+\s*mg|\d+\s*ml|\d+\s*tablets?)/i)

    const frequencyMatch =
      response.match(/frequency:?\s*(\d+)\s*times?\s*(?:per\s*)?day/i) ||
      response.match(/(\d+)\s*times?\s*(?:per\s*)?day/i) ||
      response.match(/(\d+)x\s*daily/i)

    const timeMatch =
      response.match(/time:?\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i) ||
      response.match(/starting\s*at\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i) ||
      response.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i)

    // Extract medication name from user input if not found in AI response
    const userInputMatch = inputValue.match(/add\s+([A-Za-z0-9\s-]+?)\s+(\d+\s*mg|\d+\s*ml|\d+\s*tablets?)/i)

    // Use the most reliable source for the medication name
    const medicationName = nameMatch ? nameMatch[1].trim() : userInputMatch ? userInputMatch[1].trim() : null

    // Use the most reliable source for the dosage
    const medicationDosage = dosageMatch
      ? dosageMatch[1].trim()
      : userInputMatch && userInputMatch[2]
        ? userInputMatch[2].trim()
        : null

    if (medicationName && medicationDosage) {
      return {
        name: medicationName,
        dosage: medicationDosage,
        frequency: frequencyMatch ? Number.parseInt(frequencyMatch[1]) : 1,
        firstReminderTime: timeMatch ? convertTo24Hour(timeMatch[1]) : "09:00",
      }
    }
    return null
  }

  const convertTo24Hour = (time12h: string): string => {
    // Handle already 24-hour format
    if (time12h.match(/^\d{1,2}:\d{2}$/) && !time12h.match(/AM|PM/i)) {
      const [hours, minutes] = time12h.split(":")
      return `${hours.padStart(2, "0")}:${minutes}`
    }

    // Handle 12-hour format
    const [time, modifier] = time12h.split(/\s*(AM|PM)/i)
    let [hours, minutes] = time.split(":")

    if (!modifier) {
      // No AM/PM, assume 24-hour format
      return `${hours.padStart(2, "0")}:${minutes}`
    }

    if (hours === "12") {
      hours = modifier.toUpperCase() === "AM" ? "00" : "12"
    } else if (modifier.toUpperCase() === "PM") {
      hours = (Number.parseInt(hours, 10) + 12).toString()
    }

    return `${hours.padStart(2, "0")}:${minutes}`
  }

  // Fallback response generator when API fails
  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Check if user is trying to add medication
    if (
      lowerMessage.includes("add") &&
      (lowerMessage.includes("medication") || lowerMessage.includes("pill") || lowerMessage.includes("medicine"))
    ) {
      return "I can help you add a medication to your schedule. Please provide the medication name, dosage, frequency (times per day), and first reminder time. For example: 'Add Aspirin 100mg, 2 times per day, starting at 9:00 AM'."
    }

    // Check for medication schedule questions
    if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("when") ||
      (lowerMessage.includes("take") && lowerMessage.includes("medication"))
    ) {
      if (medications.length === 0) {
        return "You don't have any medications scheduled yet. Would you like to add one?"
      } else {
        return (
          "Based on your current schedule, you have " +
          medications.length +
          " medications. You can view all details on your medication cards. Would you like me to help you add another medication?"
        )
      }
    }

    // Check for general medication questions
    if (lowerMessage.includes("medication") || lowerMessage.includes("medicine") || lowerMessage.includes("pill")) {
      return "I can provide general information about medications, but for specific medical advice, please consult your healthcare provider. Would you like to add a medication to your reminder schedule?"
    }

    // Default response
    return "I'm here to help you manage your medications. I can assist with adding new medications to your schedule, provide information about your current medications, or answer general health questions. What would you like to know?"
  }

  const callNvidiaAPI = async (prompt: string): Promise<string> => {
    try {
      // Set a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.1-24b-instruct-2503",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful medical assistant for a pill reminder app. Provide accurate, concise medical information while always recommending users consult healthcare professionals for personalized advice. When suggesting medications to add to the app, format them clearly with: Medication: [name], Dosage: [amount], Frequency: [times per day], Time: [first dose time]. Keep responses brief and clear.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
        signal: controller.signal,
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setApiError(null) // Clear any previous errors
      return data.choices[0]?.message?.content || "I apologize, but I couldn't process your request. Please try again."
    } catch (error) {
      console.error("NVIDIA API Error:", error)

      // Set specific error message based on the error
      if (error.name === "AbortError") {
        setApiError("Request timed out. Using offline mode.")
      } else if (error.message?.includes("Failed to fetch")) {
        setApiError("Network error. Using offline mode.")
      } else {
        setApiError("API error. Using offline mode.")
      }

      // Return a fallback response
      return generateFallbackResponse(prompt)
    }
  }

  const generatePrompt = (userMessage: string): string => {
    const todaysMeds = getTodaysMedications()
    const medicationContext =
      medications.length > 0
        ? `User's current medications: ${JSON.stringify(
            medications.map((med) => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              firstReminderTime: med.firstReminderTime,
              lastTaken: med.lastTaken,
            })),
          )}`
        : "User has no medications currently scheduled."

    const todaysContext =
      todaysMeds.length > 0
        ? `Today's medication schedule: ${JSON.stringify(todaysMeds)}`
        : "No medications scheduled for today."

    return `${medicationContext}

${todaysContext}

User question: "${userMessage}"

Please provide a helpful, accurate response. If the question is about medications the user is taking, reference their specific medications. If the user wants to add a new medication, format your response clearly with the medication details. Always include appropriate medical disclaimers when giving medical advice.`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      const prompt = generatePrompt(currentInput)
      const aiResponse = await callNvidiaAPI(prompt)

      // Check if the response contains a medication suggestion
      const medicationSuggestion = extractMedicationFromResponse(aiResponse + " " + currentInput)

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
        medicationSuggestion,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime12Hour = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
  }

  const handleAddMedicationFromChat = (suggestion: ChatMessage["medicationSuggestion"]) => {
    if (suggestion) {
      onAddMedication(suggestion)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "bot",
          content: `Great! I've added ${suggestion.name} (${suggestion.dosage}) to your medication schedule. You'll receive reminders ${suggestion.frequency} time${
            suggestion.frequency > 1 ? "s" : ""
          } per day starting at ${suggestion.firstReminderTime}.`,
          timestamp: new Date(),
        },
      ])
    }
  }

  const clearChatHistory = () => {
    setMessages([getWelcomeMessage()])
    localStorage.removeItem("chatbot-messages")
  }

  const handleClose = () => {
    setIsMinimized(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="w-full max-w-2xl my-auto">
        <Card
          className={`shadow-2xl border-0 bg-white dark:bg-gray-800 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[80vh] max-h-[600px]"
          }`}
        >
          {/* Fixed Header with Close Button */}
          <CardHeader className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white flex-shrink-0 sticky top-0 z-10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Medication Assistant</h3>
                  <p className="text-blue-100 text-sm font-normal">
                    {apiError ? "Offline Mode" : "Powered by NVIDIA"} • {messages.length - 1} messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 rounded-full"
                  aria-label={isMinimized ? "Maximize chatbot" : "Minimize chatbot"}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChatHistory}
                  className="text-white hover:bg-white/20 rounded-full"
                  aria-label="Clear chat history"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-red-500/30 rounded-full border border-white/20 bg-red-500/10"
                  aria-label="Close chatbot"
                  title="Close chatbot"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {/* API Error Banner */}
              {apiError && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 p-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{apiError} Using local responses only.</p>
                  </div>
                </div>
              )}

              {/* Quick Questions - Fixed */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion("What medications do I have to take today?")}
                    className="text-xs"
                  >
                    Today's meds
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion("Add Paracetamol 500mg twice daily starting at 8:00 AM")}
                    className="text-xs"
                  >
                    Add medication
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion("Are there any drug interactions with my medications?")}
                    className="text-xs"
                  >
                    Drug interactions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion("What are the side effects of my medications?")}
                    className="text-xs"
                  >
                    Side effects
                  </Button>
                </div>
              </div>

              {/* Scrollable Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-green-50/30 dark:from-gray-900/30 dark:to-gray-800/30 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user" ? "bg-blue-500 text-white" : "bg-teal-500 text-white"
                      }`}
                    >
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                      {/* Add Medication Button */}
                      {message.type === "bot" && message.medicationSuggestion && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300 mb-2">Detected medication:</p>
                          <div className="text-xs text-green-800 dark:text-green-200 mb-2">
                            <strong>{message.medicationSuggestion.name}</strong> - {message.medicationSuggestion.dosage}
                            <br />
                            {message.medicationSuggestion.frequency}x daily at{" "}
                            {message.medicationSuggestion.firstReminderTime}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddMedicationFromChat(message.medicationSuggestion)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Schedule
                          </Button>
                        </div>
                      )}

                      <p
                        className={`text-xs mt-2 ${
                          message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatTime12Hour(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Wait a sec.. I am Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex gap-3">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about medications, add new ones, or get health advice..."
                    className="flex-1 min-h-[60px] max-h-32 resize-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="self-end bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-4 py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {apiError
                    ? "🔌 Offline mode active - Using local responses only"
                    : "🤖 Powered by NVIDIA AI • Always consult healthcare professionals for medical decisions"}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
