"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot, User, Loader2, Heart, Stethoscope } from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export function HealthcareChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "bot",
      content:
        "Hello! I'm your healthcare assistant. I can help answer questions about medications, general health advice, and wellness tips. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    // Simple keyword-based responses for demonstration
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("medication") || lowerMessage.includes("pill") || lowerMessage.includes("drug")) {
      return "For medication-related questions, always consult with your healthcare provider or pharmacist. They can provide personalized advice based on your medical history. If you're using our pill reminder app, make sure to set accurate dosing schedules and never skip doses without medical guidance."
    }

    if (lowerMessage.includes("pain") || lowerMessage.includes("hurt") || lowerMessage.includes("ache")) {
      return "Pain can have many causes. For persistent or severe pain, please consult a healthcare professional. In the meantime, rest, proper hydration, and following any prescribed treatment plans can help. If you're experiencing chest pain or severe symptoms, seek immediate medical attention."
    }

    if (lowerMessage.includes("fever") || lowerMessage.includes("temperature")) {
      return "A fever is often your body's way of fighting infection. Stay hydrated, rest, and monitor your temperature. For adults, seek medical care if fever exceeds 103°F (39.4°C) or persists for more than 3 days. For children or if you have underlying conditions, consult your healthcare provider sooner."
    }

    if (lowerMessage.includes("diet") || lowerMessage.includes("nutrition") || lowerMessage.includes("food")) {
      return "A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health. Stay hydrated and limit processed foods. If you have specific dietary restrictions or health conditions, consider consulting with a registered dietitian for personalized guidance."
    }

    if (lowerMessage.includes("exercise") || lowerMessage.includes("workout") || lowerMessage.includes("fitness")) {
      return "Regular physical activity is excellent for your health! Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training twice weekly. Start slowly if you're new to exercise, and consult your doctor before beginning any new fitness program, especially if you have health conditions."
    }

    if (lowerMessage.includes("sleep") || lowerMessage.includes("tired") || lowerMessage.includes("insomnia")) {
      return "Good sleep is crucial for health. Aim for 7-9 hours nightly. Maintain a consistent sleep schedule, create a relaxing bedtime routine, limit screen time before bed, and keep your bedroom cool and dark. If sleep problems persist, consider speaking with a healthcare provider."
    }

    if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety") || lowerMessage.includes("worried")) {
      return "Managing stress is important for overall health. Try deep breathing exercises, regular physical activity, adequate sleep, and connecting with supportive people. If stress or anxiety significantly impacts your daily life, consider speaking with a mental health professional."
    }

    // Default response
    return "Thank you for your question. While I can provide general health information, it's important to consult with qualified healthcare professionals for personalized medical advice. They can properly assess your specific situation and provide appropriate guidance. Is there anything else I can help you with regarding general wellness?"
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
    setInputValue("")
    setIsLoading(true)

    try {
      const aiResponse = await simulateAIResponse(userMessage.content)

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-500 via-blue-500 to-green-500 text-white">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Healthcare Assistant</h3>
            <p className="text-blue-100 text-sm font-normal">Your personal health companion</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Heart className="h-5 w-5 text-red-300 animate-pulse" />
            <span className="text-sm text-blue-100">Online</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Chat Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-green-50/30 dark:from-gray-900/30 dark:to-gray-800/30">
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
                <p
                  className={`text-xs mt-2 ${
                    message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
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
                  <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-3">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about medications, health tips, or general wellness..."
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
            💡 This is for general information only. Always consult healthcare professionals for medical advice.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
