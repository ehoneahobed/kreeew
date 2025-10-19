"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Mail, 
  Code, 
  Eye, 
  Send, 
  Plus,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { 
  getAvailableVariables, 
  insertVariable, 
  renderPreview, 
  validateVariables 
} from "@/lib/automation/personalization"
import type { PersonalizationVariable } from "@/lib/types/automation"

type EmailTemplate = {
  readonly id: string
  readonly name: string
  readonly subject: string
  readonly htmlContent: string
}

type EmailEditorProps = {
  readonly subject: string
  readonly content: string
  readonly templateId?: string
  readonly onSubjectChange: (subject: string) => void
  readonly onContentChange: (content: string) => void
  readonly onTemplateChange: (templateId: string | undefined) => void
  readonly onPreview: (subject: string, content: string) => void
  readonly onTestSend: (subject: string, content: string) => void
  readonly publicationSlug: string
}

/**
 * Comprehensive email editor with personalization and template support
 */
export function EmailEditor({
  subject,
  content,
  templateId,
  onSubjectChange,
  onContentChange,
  onTemplateChange,
  onPreview,
  onTestSend,
  publicationSlug,
}: EmailEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validation, setValidation] = useState<{
    isValid: boolean
    invalidVariables: string[]
    missingVariables: string[]
  }>({ isValid: true, invalidVariables: [], missingVariables: [] })

  // Load email templates
  useEffect(() => {
    loadTemplates()
  }, [publicationSlug])

  // Validate content when it changes
  useEffect(() => {
    const validation = validateVariables(content || '')
    setValidation(validation)
  }, [content])

  const loadTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const response = await fetch(`/api/publications/${publicationSlug}/email-templates`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Failed to load email templates")
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      onSubjectChange(template.subject)
      onContentChange(template.htmlContent)
      onTemplateChange(templateId)
    }
  }

  const handleInsertVariable = (variable: PersonalizationVariable) => {
    const { content: newContent } = insertVariable(content, variable.key)
    onContentChange(newContent)
  }

  const handlePreview = () => {
    onPreview(subject, content)
    setShowPreview(true)
  }

  const handleTestSend = () => {
    onTestSend(subject, content)
  }

  const selectedTemplate = templates.find(t => t.id === templateId)

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <Label className="text-xs">Email Template</Label>
        <div className="flex gap-2 mt-1">
          <Select
            value={templateId || ""}
            onValueChange={(value) => {
              if (value === "none") {
                onTemplateChange(undefined)
              } else {
                handleTemplateSelect(value)
              }
            }}
            disabled={isLoadingTemplates}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a template or create from scratch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Create from scratch</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTemplates}
            disabled={isLoadingTemplates}
            type="button"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {selectedTemplate && (
          <p className="text-xs text-muted-foreground mt-1">
            Using template: {selectedTemplate.name}
          </p>
        )}
      </div>

      {/* Subject Line */}
      <div>
        <Label htmlFor="email-subject" className="text-xs">
          Subject Line
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject"
            className="flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                <Code className="w-3 h-3 mr-1" />
                Variables
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
              {getAvailableVariables().map((variable) => (
                <DropdownMenuItem
                  key={variable.key}
                  onClick={() => {
                    const { content: newSubject } = insertVariable(subject, variable.key)
                    onSubjectChange(newSubject)
                  }}
                  className="flex flex-col items-start p-2"
                >
                  <code className="font-mono text-primary text-xs">{variable.key}</code>
                  <span className="text-xs text-muted-foreground">{variable.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="email-content" className="text-xs">
            Email Content
          </Label>
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">
                  {validation.invalidVariables.length} invalid variables
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Variable Insertion Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
            <span className="text-xs text-muted-foreground mr-2">Insert:</span>
            {getAvailableVariables().slice(0, 6).map((variable) => (
              <Button
                key={variable.key}
                variant="ghost"
                size="sm"
                onClick={() => handleInsertVariable(variable)}
                className="text-xs h-6 px-2"
                type="button"
              >
                {variable.label}
              </Button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" type="button">
                  More...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
                {getAvailableVariables().slice(6).map((variable) => (
                  <DropdownMenuItem
                    key={variable.key}
                    onClick={() => handleInsertVariable(variable)}
                    className="flex flex-col items-start p-2"
                  >
                    <code className="font-mono text-primary text-xs">{variable.key}</code>
                    <span className="text-xs text-muted-foreground">{variable.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Textarea
            id="email-content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Enter email content (HTML supported)"
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        {/* Validation Warnings */}
        {!validation.isValid && (
          <div className="mt-2 p-2 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs font-medium text-red-800">Invalid Variables</span>
            </div>
            <div className="space-y-1">
              {validation.invalidVariables.map((variable) => (
                <div key={variable} className="text-xs text-red-700">
                  • <code>{variable}</code> is not a valid variable
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="flex-1"
          type="button"
        >
          <Eye className="w-3 h-3 mr-2" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestSend}
          className="flex-1"
          type="button"
        >
          <Send className="w-3 h-3 mr-2" />
          Test Send
        </Button>
      </div>
    </div>
  )
}
