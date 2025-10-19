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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  X, 
  Send, 
  Eye, 
  Smartphone, 
  Monitor,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { renderPreview, SAMPLE_PERSONALIZATION_DATA } from "@/lib/automation/personalization"

type EmailPreviewModalProps = {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly subject: string
  readonly content: string
  readonly onTestSend: (email: string, subject: string, content: string) => void
  readonly publicationSlug: string
  readonly workflowId: string
}

/**
 * Email preview modal with device preview and test send functionality
 */
export function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  content,
  onTestSend,
  publicationSlug,
  workflowId,
}: EmailPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [testEmail, setTestEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [customPersonalization, setCustomPersonalization] = useState<Record<string, string>>({})
  const [renderedSubject, setRenderedSubject] = useState("")
  const [renderedContent, setRenderedContent] = useState("")

  // Update rendered content when subject, content, or personalization changes
  useEffect(() => {
    const personalization = { ...SAMPLE_PERSONALIZATION_DATA, ...customPersonalization }
    setRenderedSubject(renderPreview(subject || '', personalization))
    setRenderedContent(renderPreview(content || '', personalization))
  }, [subject, content, customPersonalization])

  const handleTestSend = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter a test email address")
      return
    }

    setIsSending(true)
    try {
      await onTestSend(testEmail, subject, content)
      toast.success("Test email sent successfully")
      onClose()
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Failed to send test email")
    } finally {
      setIsSending(false)
    }
  }

  const updatePersonalization = (key: string, value: string) => {
    setCustomPersonalization(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetPersonalization = () => {
    setCustomPersonalization({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Email Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 space-y-4 overflow-y-auto">
            {/* Device Preview Toggle */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                    className="flex-1"
                    type="button"
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                    className="flex-1"
                    type="button"
                  >
                    <Smartphone className="w-3 h-3 mr-1" />
                    Mobile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Data */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Sample Data</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPersonalization}
                    type="button"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(SAMPLE_PERSONALIZATION_DATA).map(([key, defaultValue]) => (
                    <div key={key}>
                      <Label className="text-xs">{key.replace(/[{}]/g, '')}</Label>
                      <Input
                        value={customPersonalization[key] || defaultValue}
                        onChange={(e) => updatePersonalization(key, e.target.value)}
                        className="text-xs"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Send */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Test Send</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label htmlFor="test-email" className="text-xs">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleTestSend}
                  disabled={isSending || !testEmail.trim()}
                  className="w-full"
                  size="sm"
                  type="button"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Email Preview */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Email Preview</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {previewMode === "desktop" ? "Desktop" : "Mobile"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className={`${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                  {/* Email Header */}
                  <div className="border-b pb-2 mb-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Subject:</div>
                    <div className="text-lg font-semibold">{renderedSubject}</div>
                  </div>

                  {/* Email Content */}
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
