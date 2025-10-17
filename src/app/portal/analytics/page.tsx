"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Filter
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AnalyticsData {
  totalViews: number
  totalReads: number
  totalSubscribers: number
  totalPosts: number
  readRate: number
  engagementRate: number
  topPosts: Array<{
    id: string
    title: string
    views: number
    reads: number
    readRate: number
    publication: {
      name: string
      slug: string
    }
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    publication: {
      name: string
      slug: string
    }
  }>
}

export default function GlobalAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No analytics data available</h1>
          <Button asChild>
            <Link href="/portal/publications">Go to Publications</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance across all your publications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "90d" | "1y")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Across all publications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalReads)}</div>
            <p className="text-xs text-muted-foreground">
              Engaged readers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalSubscribers)}</div>
            <p className="text-xs text-muted-foreground">
              Total subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.readRate)}</div>
            <p className="text-xs text-muted-foreground">
              Views to reads conversion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your best content by engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPosts.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topPosts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {post.publication.name}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{formatNumber(post.views)} views</span>
                        <span>{formatNumber(post.reads)} reads</span>
                        <span>{formatPercentage(post.readRate)} read rate</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${post.publication.slug}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest events across your publications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.publication.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
          <CardDescription>
            How your audience interacts with your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatPercentage(analytics.readRate)}
              </div>
              <p className="text-sm text-muted-foreground">Read Rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of viewers who read your content
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatPercentage(analytics.engagementRate)}
              </div>
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Overall audience engagement
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.totalPosts}
              </div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-xs text-muted-foreground mt-1">
                Published across all publications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

