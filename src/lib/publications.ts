import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

export interface CreatePublicationData {
  name: string
  slug: string
  description?: string
  domain?: string
  themeColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
}

export interface UpdatePublicationData {
  name?: string
  description?: string
  domain?: string
  themeColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
}

/**
 * Create a new publication for a user
 */
export async function createPublication(
  userId: string,
  data: CreatePublicationData
) {
  // Check if slug is already taken
  const existingPublication = await prisma.publication.findUnique({
    where: { slug: data.slug },
  })

  if (existingPublication) {
    throw new Error("Publication slug already exists")
  }

  // Check if domain is already taken (if provided)
  if (data.domain) {
    const existingDomain = await prisma.publication.findUnique({
      where: { domain: data.domain },
    })

    if (existingDomain) {
      throw new Error("Domain already in use")
    }
  }

  return await prisma.publication.create({
    data: {
      userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      domain: data.domain,
      themeColors: data.themeColors,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          posts: true,
          subscriptions: true,
          subscriberContacts: true,
        },
      },
    },
  })
}

/**
 * Get all publications for a user
 */
export async function getUserPublications(userId: string) {
  return await prisma.publication.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          posts: true,
          subscriptions: true,
          subscriberContacts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get a publication by slug
 */
export async function getPublicationBySlug(slug: string) {
  return await prisma.publication.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
      subscriptionTiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      _count: {
        select: {
          posts: true,
          subscriptions: true,
          subscriberContacts: true,
        },
      },
    },
  })
}

/**
 * Get a publication by slug for dashboard (includes all posts including drafts)
 */
export async function getPublicationByIdForDashboard(slug: string, userId: string) {
  return await prisma.publication.findFirst({
    where: { 
      slug,
      userId, // Ensure user owns this publication
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      posts: {
        orderBy: { createdAt: "desc" }, // Include all posts (drafts, published, etc.)
      },
      subscriptionTiers: {
        orderBy: { price: "asc" },
      },
      courses: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
      emailCampaigns: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          posts: true,
          subscriptions: true,
          subscriberContacts: true,
          courses: true,
          emailCampaigns: true,
        },
      },
    },
  })
}

/**
 * Get a publication by ID (for authenticated users)
 */
export async function getPublicationById(id: string, userId: string) {
  return await prisma.publication.findFirst({
    where: { 
      id,
      userId, // Ensure user owns this publication
    },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
      },
      subscriptionTiers: {
        orderBy: { price: "asc" },
      },
      courses: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
      emailCampaigns: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          posts: true,
          subscriptions: true,
          subscriberContacts: true,
          courses: true,
          emailCampaigns: true,
        },
      },
    },
  })
}

/**
 * Update a publication
 */
export async function updatePublication(
  id: string,
  userId: string,
  data: UpdatePublicationData
) {
  // Check if domain is already taken (if provided)
  if (data.domain) {
    const existingDomain = await prisma.publication.findFirst({
      where: { 
        domain: data.domain,
        id: { not: id },
      },
    })

    if (existingDomain) {
      throw new Error("Domain already in use")
    }
  }

  return await prisma.publication.update({
    where: { 
      id,
      userId, // Ensure user owns this publication
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })
}

/**
 * Delete a publication
 */
export async function deletePublication(id: string, userId: string) {
  // Check if user owns this publication
  const publication = await prisma.publication.findFirst({
    where: { 
      id,
      userId,
    },
  })

  if (!publication) {
    throw new Error("Publication not found or access denied")
  }

  // Delete the publication (cascade will handle related records)
  return await prisma.publication.delete({
    where: { id },
  })
}

/**
 * Check if a publication slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string) {
  const publication = await prisma.publication.findUnique({
    where: { slug },
  })

  if (!publication) return true
  if (excludeId && publication.id === excludeId) return true
  
  return false
}

/**
 * Check if a domain is available
 */
export async function isDomainAvailable(domain: string, excludeId?: string) {
  const publication = await prisma.publication.findUnique({
    where: { domain },
  })

  if (!publication) return true
  if (excludeId && publication.id === excludeId) return true
  
  return false
}

/**
 * Generate a unique slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Get publication analytics summary
 */
export async function getPublicationAnalytics(publicationId: string, userId: string) {
  // Verify ownership
  const publication = await prisma.publication.findFirst({
    where: { 
      id: publicationId,
      userId,
    },
  })

  if (!publication) {
    throw new Error("Publication not found or access denied")
  }

  // Get analytics data
  const [
    totalPosts,
    publishedPosts,
    totalSubscribers,
    totalViews,
    recentPosts,
    subscriberGrowth,
  ] = await Promise.all([
    prisma.post.count({
      where: { publicationId },
    }),
    prisma.post.count({
      where: { publicationId, status: "PUBLISHED" },
    }),
    prisma.subscriberContact.count({
      where: { 
        publicationId,
        isActive: true,
      },
    }),
    prisma.analytics.aggregate({
      where: { publicationId },
      _sum: { views: true },
    }),
    prisma.post.findMany({
      where: { 
        publicationId,
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        publishedAt: true,
        _count: {
          select: {
            analytics: true,
          },
        },
      },
    }),
    // Get subscriber growth over last 30 days
    prisma.subscriberContact.groupBy({
      by: ["createdAt"],
      where: {
        publicationId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
      _count: {
        id: true,
      },
    }),
  ])

  return {
    totalPosts,
    publishedPosts,
    totalSubscribers,
    totalViews: totalViews._sum.views || 0,
    recentPosts,
    subscriberGrowth,
  }
}

/**
 * Get publication settings for editing
 */
export async function getPublicationSettings(publicationId: string, userId: string) {
  const publication = await prisma.publication.findFirst({
    where: { 
      id: publicationId,
      userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      domain: true,
      themeColors: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!publication) {
    throw new Error("Publication not found or access denied")
  }

  return publication
}

/**
 * Get a post by publication slug and post slug (public access)
 */
export async function getPostBySlug(publicationSlug: string, postSlug: string) {
  return await prisma.post.findFirst({
    where: {
      slug: postSlug,
      status: "PUBLISHED",
      publication: {
        slug: publicationSlug,
      },
    },
    include: {
      publication: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              posts: true,
              subscriptions: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Get course data for public viewing
 */
export async function getCourseByIdForPublic(courseId: string, publicationSlug: string) {
  try {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        publication: {
          slug: publicationSlug
        },
        // Show both published and draft courses for public view (for course owners)
        // status: "PUBLISHED"
      },
      include: {
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        lessons: {
          where: {
            isPublished: true
          },
          select: {
            id: true,
            title: true,
            content: true,
            order: true
          },
          orderBy: {
            order: "asc"
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    return course
  } catch (error) {
    console.error("Error fetching course:", error)
    return null
  }
}
