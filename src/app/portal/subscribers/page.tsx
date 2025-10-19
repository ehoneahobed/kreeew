"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Calendar,
  Tag,
  MoreHorizontal,
  BookOpen
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
  user?: {
    id: string
    name?: string
    email: string
    image?: string
    courseEnrollments?: {
      id: string
      course: {
        id: string
        title: string
      }
    }[]
  }
}

export default function GlobalSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [selectedPublications, setSelectedPublications] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{from?: string, to?: string}>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })
  
  // Dynamic filter data
  const [availablePublications, setAvailablePublications] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [availableCourses, setAvailableCourses] = useState<Array<{id: string, title: string}>>([])
  const [availableCampaigns, setAvailableCampaigns] = useState<Array<{id: string, name: string}>>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [filterDataLoading, setFilterDataLoading] = useState(true)

  useEffect(() => {
    fetchAllSubscribers()
  }, [pagination.page, searchTerm, filterStatus, selectedPublications, selectedCourses, selectedCampaigns, selectedTags, dateRange])

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      setFilterDataLoading(true)
      const response = await fetch('/api/subscribers/filter-data')
      
      if (!response.ok) {
        throw new Error("Failed to fetch filter data")
      }

      const data = await response.json()
      setAvailablePublications(data.publications || [])
      setAvailableCourses(data.courses || [])
      setAvailableCampaigns(data.campaigns || [])
      setAvailableTags(data.tags || [])
    } catch (error) {
      console.error("Error fetching filter data:", error)
      toast.error("Failed to load filter options")
    } finally {
      setFilterDataLoading(false)
    }
  }

  const fetchAllSubscribers = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      
      if (searchTerm) params.set('search', searchTerm)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      selectedPublications.forEach(pub => params.append('publications', pub))
      selectedCourses.forEach(course => params.append('courses', course))
      selectedCampaigns.forEach(campaign => params.append('campaigns', campaign))
      selectedTags.forEach(tag => params.append('tags', tag))
      if (dateRange.from) params.set('dateFrom', dateRange.from)
      if (dateRange.to) params.set('dateTo', dateRange.to)

      const response = await fetch(`/api/subscribers?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("API Error:", errorData)
        throw new Error(`Failed to fetch subscribers: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast.error("Failed to load subscribers")
    } finally {
      setLoading(false)
    }
  }

  // Server-side filtering, no need for client-side filtering
  const filteredSubscribers = subscribers

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

      {/* Enhanced Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search subscribers by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={dateRange.from || ""}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={dateRange.to || ""}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("all")
                  setSelectedPublications([])
                  setSelectedCourses([])
                  setSelectedCampaigns([])
                  setSelectedTags([])
                  setDateRange({})
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Filter Row 2 - Multi-selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Publications</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {filterDataLoading ? (
                  <div className="text-sm text-muted-foreground">Loading publications...</div>
                ) : availablePublications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No publications found</div>
                ) : (
                  availablePublications.map((pub) => (
                    <div key={pub.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pub-${pub.slug}`}
                        checked={selectedPublications.includes(pub.slug)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPublications(prev => [...prev, pub.slug])
                          } else {
                            setSelectedPublications(prev => prev.filter(p => p !== pub.slug))
                          }
                        }}
                      />
                      <label htmlFor={`pub-${pub.slug}`} className="text-sm">{pub.name}</label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Courses</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {filterDataLoading ? (
                  <div className="text-sm text-muted-foreground">Loading courses...</div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No courses found</div>
                ) : (
                  availableCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCourses(prev => [...prev, course.id])
                          } else {
                            setSelectedCourses(prev => prev.filter(c => c !== course.id))
                          }
                        }}
                      />
                      <label htmlFor={`course-${course.id}`} className="text-sm">
                        {course.title}
                        {course.publicationName && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({course.publicationName})
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Campaigns</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {filterDataLoading ? (
                  <div className="text-sm text-muted-foreground">Loading campaigns...</div>
                ) : availableCampaigns.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No campaigns found</div>
                ) : (
                  availableCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`campaign-${campaign.id}`}
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCampaigns(prev => [...prev, campaign.id])
                          } else {
                            setSelectedCampaigns(prev => prev.filter(c => c !== campaign.id))
                          }
                        }}
                      />
                      <label htmlFor={`campaign-${campaign.id}`} className="text-sm">
                        {campaign.name}
                        {campaign.publicationName && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({campaign.publicationName})
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(prev => prev.filter(t => t !== tag))
                      } else {
                        setSelectedTags(prev => [...prev, tag])
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedPublications.length > 0 || selectedCourses.length > 0 || selectedCampaigns.length > 0 || selectedTags.length > 0) && (
            <div>
              <label className="text-sm font-medium mb-2 block">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {selectedPublications.map(pub => {
                  const publication = availablePublications.find(p => p.slug === pub)
                  return (
                    <Badge key={pub} variant="secondary" className="cursor-pointer" onClick={() => setSelectedPublications(prev => prev.filter(p => p !== pub))}>
                      Publication: {publication?.name || pub} ×
                    </Badge>
                  )
                })}
                {selectedCourses.map(courseId => {
                  const course = availableCourses.find(c => c.id === courseId)
                  return (
                    <Badge key={courseId} variant="secondary" className="cursor-pointer" onClick={() => setSelectedCourses(prev => prev.filter(c => c !== courseId))}>
                      Course: {course?.title || courseId} ×
                    </Badge>
                  )
                })}
                {selectedCampaigns.map(campaignId => {
                  const campaign = availableCampaigns.find(c => c.id === campaignId)
                  return (
                    <Badge key={campaignId} variant="secondary" className="cursor-pointer" onClick={() => setSelectedCampaigns(prev => prev.filter(c => c !== campaignId))}>
                      Campaign: {campaign?.name || campaignId} ×
                    </Badge>
                  )
                })}
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}>
                    Tag: {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                      {subscriber.user?.courseEnrollments && subscriber.user.courseEnrollments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{subscriber.user.courseEnrollments.length} courses</span>
                        </div>
                      )}
                      {subscriber._count.emailLogs > 0 && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{subscriber._count.emailLogs} emails</span>
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
