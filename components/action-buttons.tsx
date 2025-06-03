"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Upload } from "lucide-react"
import type { Medication } from "@/types/medication"

interface ActionButtonsProps {
  editingMedication: Medication | null
  showForm: boolean
  medicationsCount: number
  onToggleForm: () => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ActionButtons({
  editingMedication,
  showForm,
  medicationsCount,
  onToggleForm,
  onExport,
  onImport,
}: ActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-4">
      <Button
        onClick={onToggleForm}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        {editingMedication ? "Cancel Edit" : "Add New Medication"}
      </Button>

      {/* Export/Import Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onExport}
          variant="outline"
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg shadow-sm"
          disabled={medicationsCount === 0}
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg shadow-sm"
        >
          <Upload className="h-5 w-5 mr-2" />
          Import
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json"
            className="hidden"
            aria-label="Import medications from JSON file"
          />
        </Button>
      </div>
    </div>
  )
}
