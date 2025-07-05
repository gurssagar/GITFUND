"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StepFourProps {
  formData: ProfileFormData
  errors: Record<string, string>
  updateFormData: (field: keyof ProfileFormData, value: any) => void
}

const PROGRAMMING_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Vue.js",
  "Angular",
  "Svelte",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Laravel",
  "Rails",
  "PostgreSQL",
  "MongoDB",
  "Redis",
]

export function StepFour({ formData, errors, updateFormData }: StepFourProps) {
  const [customSkill, setCustomSkill] = useState("")

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      updateFormData("skills", [...formData.skills, skill])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    updateFormData(
      "skills",
      formData.skills.filter((skill) => skill !== skillToRemove),
    )
  }

  const addCustomSkill = () => {
    const trimmedSkill = customSkill.trim()
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      addSkill(trimmedSkill)
      setCustomSkill("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomSkill()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Skills & Expertise</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select your skills to help others find you for collaboration.
        </p>
      </div>

      <div className="space-y-4">
        {/* Selected Skills */}
        {formData.skills.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Selected Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X size={12} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Skill */}
        <div>
          <Label htmlFor="custom-skill" className="text-sm font-medium">
            Add Custom Skill
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="custom-skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a skill..."
              className="flex-1"
            />
            <Button onClick={addCustomSkill} variant="outline" size="sm" disabled={!customSkill.trim()}>
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Predefined Skills */}
        <div>
          <Label className="text-sm font-medium">Popular Skills</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {PROGRAMMING_SKILLS.map((skill) => (
              <Button
                key={skill}
                variant={formData.skills.includes(skill) ? "default" : "outline"}
                onClick={() => (formData.skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
                size="sm"
                className="justify-start text-xs"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        {errors.skills && (
          <Alert variant="destructive">
            <AlertDescription>{errors.skills}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
