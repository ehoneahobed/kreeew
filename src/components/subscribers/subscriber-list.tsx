"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Filter,
  Mail,
  User,
  Calendar,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Subscriber {
  id: string
  email: string
  tags: string[]
  customFields?: Record<string, any>
  preferences?: Record<string, any>
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface SubscriberListProps {
  subscribers: Subscriber[]
  onEdit: (subscriber: Subscriber) => void
  onDelete: (subscriberId: string) => void
  onToggleStatus: (subscriberId: string, isActive: boolean) => void
  onAddTag: (subscriberId: string, tag: string) => void
  onRemoveTag: (subscriberId: string, tag: string) => void
  loading?: boolean
}

export function SubscriberList({ 
  subscribers, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onAddTag,
  onRemoveTag,
  loading = false 
}: SubscriberListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && subscriber.isActive) ||
                         (statusFilter === "inactive" && !subscriber.isActive)
    
    const matchesTag = tagFilter === "all" || subscriber.tags.includes(tagFilter)
    
    return matchesSearch && matchesStatus && matchesTag
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getUniqueTags = () => {
    const allTags = subscribers.flatMap(s => s.tags)
    return Array.from(new Set(allTags))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {getUniqueTags().map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subscribers List */}
      <div className="space-y-2">
        {filteredSubscribers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscribers found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== "all" || tagFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No subscribers have joined your publication yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubscribers.map((subscriber) => (
            <Card key={subscriber.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h4 className="font-medium">{subscriber.email}</h4>
                        {subscriber.user?.name && (
                          <p className="text-sm text-muted-foreground">
                            {subscriber.user.name}
                          </p>
                        )}
                      </div>
                      <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(subscriber.subscribedAt)}</span>
                      </div>
                      
                      {subscriber.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <div className="flex gap-1">
                            {subscriber.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(subscriber.id, !subscriber.isActive)}
                    >
                      {subscriber.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(subscriber)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(subscriber.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


