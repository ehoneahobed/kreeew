"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Save, 
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name?: string
  email: string
  image?: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const [preferences, setPreferences] = useState({
    theme: "system" as "light" | "dark" | "system",
    emailNotifications: true,
    marketingEmails: false,
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user/profile")
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || "",
        email: data.user.email,
      })
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const { user: updatedUser } = await response.json()
      setUser(updatedUser)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update preferences")
      }

      toast.success("Preferences updated successfully")
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your publications, posts, and data.")) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete account")
      }

      toast.success("Account deleted successfully")
      window.location.href = "/"
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize your interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={preferences.theme}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    theme: e.target.value as "light" | "dark" | "system" 
                  }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <Button onClick={handleSavePreferences} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your publications
                  </p>
                </div>
                <input
                  id="email-notifications"
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    emailNotifications: e.target.checked 
                  }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <input
                  id="marketing-emails"
                  type="checkbox"
                  checked={preferences.marketingEmails}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    marketingEmails: e.target.checked 
                  }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>

              <Button onClick={handleSavePreferences} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Account Security</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your account is secured with OAuth authentication. To change your password or security settings, 
                  please update them in your connected account provider.
                </p>
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email: {user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Account created: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. This will permanently delete:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• All your publications and posts</li>
                  <li>• All subscribers and contacts</li>
                  <li>• All email campaigns and courses</li>
                  <li>• All analytics data</li>
                  <li>• Your account and profile</li>
                </ul>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {saving ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

