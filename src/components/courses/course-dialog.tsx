"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Course {
  id?: string
  title: string
  description?: string
  price: number
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

interface CourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  onSave: (course: Omit<Course, 'id'>) => void
  loading?: boolean
}

export function CourseDialog({ open, onOpenChange, course, onSave, loading = false }: CourseDialogProps) {
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    title: "",
    description: "",
    price: 0,
    status: "DRAFT",
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || "",
        price: course.price,
        status: course.status || "DRAFT",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        status: "DRAFT",
      })
    }
  }, [course])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Course title is required")
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {course ? "Edit Course" : "Create Course"}
          </DialogTitle>
          <DialogDescription>
            {course 
              ? "Update the course details below."
              : "Create a new email course for your publication."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Complete Guide to Email Marketing"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what students will learn in this course..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price (in cents)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              placeholder="0 for free course, 999 for $9.99"
            />
            <p className="text-xs text-muted-foreground">
              Enter price in cents (e.g., 999 = $9.99)
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

