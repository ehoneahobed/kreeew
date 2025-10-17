"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Eye,
  BookOpen,
  TrendingUp,
  Users,
  Calendar,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AnalyticsData {
  totalViews: number
  totalReads: number
  totalEngagement: number
  readRate: number
  topPosts: Array<{
    post: {
      id: string
      title: string
      slug: string
    }
    views: number
    reads: number
    engagement: number
  }>
  dailyData: Array<{
    id: string
    views: number
    reads: number
    engagement: number
    date: string
    post?: {
      id: string
      title: string
      slug: string
    }
  }>
}

interface AnalyticsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30") // days

  useEffect(() => {
    fetchAnalytics()
  }, [resolvedParams.slug, dateRange])

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const response = await fetch(
        `/api/publications/${resolvedParams.slug}/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      
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
          <h1 className="text-2xl font-bold mb-4">Analytics Unavailable</h1>
          <p className="text-muted-foreground mb-6">Unable to load analytics data.</p>
          <Button asChild>
            <Link href={`/portal/publications/${resolvedParams.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Publication
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your publication's performance and engagement
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Time Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Page views across all posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalReads)}</div>
            <p className="text-xs text-muted-foreground">
              Complete article reads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.readRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Views that resulted in reads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEngagement.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Total engagement score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your most viewed content in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPosts.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topPosts.map((post, index) => (
                  <div key={post.post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{post.post.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {formatNumber(post.reads)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {post.engagement.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
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
              Daily performance over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.dailyData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activity data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.dailyData.slice(0, 10).map((day) => (
                  <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                      {day.post && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {day.post.title}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {day.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {day.reads}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


