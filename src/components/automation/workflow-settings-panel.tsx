"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Mail, 
  Code, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { getAvailableVariables, validateVariables } from "@/lib/automation/personalization"
import type { 
  AutomationWorkflow, 
  TriggerType, 
  PersonalizationVariable 
} from "@/lib/types/automation"

type WorkflowSettingsPanelProps = {
  readonly workflow: AutomationWorkflow | null
  readonly onUpdateWorkflow: (updates: {
    name?: string
    description?: string
    trigger?: TriggerType
  }) => Promise<void>
  readonly onClose: () => void
}

/**
 * Workflow settings panel with tabs for general settings, templates, and variables
 */
export function WorkflowSettingsPanel({
  workflow,
  onUpdateWorkflow,
  onClose,
}: WorkflowSettingsPanelProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [trigger, setTrigger] = useState<TriggerType>("SUBSCRIBE")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data when workflow changes
  useEffect(() => {
    if (workflow) {
      setName(workflow.name)
      setDescription(workflow.description || "")
      setTrigger(workflow.trigger)
      setHasChanges(false)
    }
  }, [workflow])

  // Track changes
  useEffect(() => {
    if (workflow) {
      const hasNameChange = name !== workflow.name
      const hasDescriptionChange = description !== (workflow.description || "")
      const hasTriggerChange = trigger !== workflow.trigger
      setHasChanges(hasNameChange || hasDescriptionChange || hasTriggerChange)
    }
  }, [name, description, trigger, workflow])

  const handleSave = async () => {
    if (!workflow || !hasChanges) return

    setIsSaving(true)
    try {
      await onUpdateWorkflow({
        name: name !== workflow.name ? name : undefined,
        description: description !== (workflow.description || "") ? description : undefined,
        trigger: trigger !== workflow.trigger ? trigger : undefined,
      })
      setHasChanges(false)
      toast.success("Workflow settings saved")
    } catch (error) {
      console.error("Error saving workflow settings:", error)
      toast.error("Failed to save workflow settings")
    } finally {
      setIsSaving(false)
    }
  }

  const getTriggerLabel = (triggerType: TriggerType): string => {
    switch (triggerType) {
      case "SUBSCRIBE": return "New Subscriber"
      case "UNSUBSCRIBE": return "Unsubscribe"
      case "POST_PUBLISHED": return "Post Published"
      case "COURSE_ENROLLED": return "Course Enrolled"
      case "TAG_ADDED": return "Tag Added"
      case "TAG_REMOVED": return "Tag Removed"
      case "TIER_CHANGED": return "Tier Changed"
      case "CUSTOM_DATE": return "Custom Date"
      case "FORM_SUBMITTED": return "Form Submitted"
      case "POST_VIEWED": return "Post Viewed"
      default: return triggerType
    }
  }

  if (!workflow) {
    return (
      <Card className="w-80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Workflow Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No workflow selected
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Workflow Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            <TabsTrigger value="variables" className="text-xs">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="workflow-name" className="text-xs">
                  Workflow Name
                </Label>
                <Input
                  id="workflow-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="workflow-description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="workflow-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Trigger Type</Label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  <Badge variant="outline" className="text-xs">
                    {getTriggerLabel(trigger)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger type cannot be changed after creation
                  </p>
                </div>
              </div>
            </div>

            {hasChanges && (
              <div className="pt-2 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  size="sm" 
                  className="w-full"
                  type="button"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Email templates will be available here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create templates in the Email Templates section
              </p>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <h4 className="text-sm font-medium">Available Variables</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Use these variables in your email content and subject lines
              </p>
              
              <Separator />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getAvailableVariables().map((variable) => (
                  <div key={variable.key} className="p-2 border rounded text-xs">
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-primary">{variable.key}</code>
                      <Badge variant="secondary" className="text-xs">
                        {variable.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {variable.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Example: {variable.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
