"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Calendar,
  Tag,
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  subscribedAt: string
  tags: string[]
  publication: {
    id: string
    name: string
    slug: string
  }
  user?: {
    id: string
    name?: string
    email: string
    image?: string
  }
  _count: {
    emailLogs: number
  }
}

export default function GlobalSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    fetchAllSubscribers()
  }, [])

  const fetchAllSubscribers = async () => {
    try {
      const response = await fetch("/api/subscribers")
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers")
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast.error("Failed to load subscribers")
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.publication.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && subscriber.isActive) ||
                         (filterStatus === "inactive" && !subscriber.isActive)
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscribers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Subscribers</h1>
        <p className="text-muted-foreground">
          Manage subscribers across all your publications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all publications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unsubscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => {
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                return new Date(s.createdAt) > monthAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
          <CardDescription>
            Manage your subscriber base across all publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscribers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "You don't have any subscribers yet. Create content to attract readers!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="font-medium">{subscriber.email}</h3>
                        {subscriber.user?.name && (
                          <p className="text-sm text-muted-foreground">{subscriber.user.name}</p>
                        )}
                      </div>
                      <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {subscriber.publication.name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {new Date(subscriber.subscribedAt).toLocaleDateString()}</span>
                      </div>
                      {subscriber.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{subscriber.tags.length} tags</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
