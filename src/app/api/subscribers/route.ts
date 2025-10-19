import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const tags = searchParams.getAll('tags')
    const publications = searchParams.getAll('publications')
    const courses = searchParams.getAll('courses')
    const campaigns = searchParams.getAll('campaigns')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Get all publications for the user
    const userPublications = await prisma.publication.findMany({
      where: { userId: session.user.id },
      select: { id: true, slug: true, name: true },
    })

    if (userPublications.length === 0) {
      return NextResponse.json({ subscribers: [], pagination: { page, limit, total: 0, pages: 0 } })
    }

    const userPublicationIds = userPublications.map(p => p.id)

    // Build where clause
    const whereClause: any = { 
      publicationId: { in: userPublicationIds }
    }

    // Apply filters
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status) {
      whereClause.isActive = status === 'active'
    }

    if (tags.length > 0) {
      whereClause.tags = { hasSome: tags }
    }

    if (publications.length > 0) {
      const filteredPubIds = userPublications
        .filter(p => publications.includes(p.slug))
        .map(p => p.id)
      whereClause.publicationId = { in: filteredPubIds }
    }

    if (dateFrom || dateTo) {
      whereClause.subscribedAt = {}
      if (dateFrom) whereClause.subscribedAt.gte = new Date(dateFrom)
      if (dateTo) whereClause.subscribedAt.lte = new Date(dateTo)
    }

    // Handle course and campaign filters with complex queries
    let courseFilter = {}
    let campaignFilter = {}

    if (courses.length > 0) {
      courseFilter = {
        user: {
          courseEnrollments: {
            some: {
              courseId: { in: courses }
            }
          }
        }
      }
    }

    if (campaigns.length > 0) {
      campaignFilter = {
        emailLogs: {
          some: {
            campaignId: { in: campaigns }
          }
        }
      }
    }

    // Combine all filters
    const finalWhereClause = {
      ...whereClause,
      ...(Object.keys(courseFilter).length > 0 && courseFilter),
      ...(Object.keys(campaignFilter).length > 0 && campaignFilter)
    }

    // If course filter is active, we need to include enrolled users who might not have SubscriberContact records
    let subscribers, total
    
    if (courses.length > 0) {
      // Get enrolled users who have SubscriberContact records
      const enrolledSubscribers = await prisma.subscriberContact.findMany({
        where: finalWhereClause,
        include: {
          publication: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              courseEnrollments: {
                include: {
                  course: {
                    select: {
                      id: true,
                      title: true,
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              emailLogs: true,
            },
          }
        },
        orderBy: { subscribedAt: "desc" },
      })

      // Get enrolled users who don't have SubscriberContact records
      const enrolledUsersWithoutSubscriberContact = await prisma.user.findMany({
        where: {
          courseEnrollments: {
            some: {
              courseId: { in: courses },
              course: {
                publicationId: { in: userPublicationIds }
              }
            }
          },
          subscriberContacts: {
            none: {
              publicationId: { in: userPublicationIds }
            }
          }
        },
        include: {
          courseEnrollments: {
            where: {
              courseId: { in: courses }
            },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  publication: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Convert enrolled users to subscriber-like format
      const enrolledUsersAsSubscribers = enrolledUsersWithoutSubscriberContact.map(user => ({
        id: `user-${user.id}`,
        email: user.email,
        isActive: true,
        subscribedAt: user.courseEnrollments[0]?.enrolledAt?.toISOString() || new Date().toISOString(),
        tags: [],
        publication: user.courseEnrollments[0]?.course.publication || userPublications[0],
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          courseEnrollments: user.courseEnrollments
        },
        _count: {
          emailLogs: 0
        }
      }))

      // Combine and sort all results
      const allResults = [...enrolledSubscribers, ...enrolledUsersAsSubscribers]
        .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())

      // Apply pagination
      const startIndex = (page - 1) * limit
      subscribers = allResults.slice(startIndex, startIndex + limit)
      total = allResults.length
    } else {
      // Original logic for non-course filters
      const [subscriberResults, totalCount] = await Promise.all([
        prisma.subscriberContact.findMany({
          where: finalWhereClause,
          include: {
            publication: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                courseEnrollments: {
                  include: {
                    course: {
                      select: {
                        id: true,
                        title: true,
                      }
                    }
                  }
                }
              }
            },
            _count: {
              select: {
                emailLogs: true,
              },
            }
          },
          orderBy: { subscribedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.subscriberContact.count({
          where: finalWhereClause,
        }),
      ])
      subscribers = subscriberResults
      total = totalCount
    }

    return NextResponse.json({ 
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching all subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    )
  }
}
