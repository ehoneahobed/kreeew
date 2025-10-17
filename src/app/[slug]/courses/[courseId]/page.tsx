import { getCourseByIdForPublic } from "@/lib/publications"
import { notFound } from "next/navigation"
import { CoursePageClient } from "./course-page-client"

interface PublicCoursePageProps {
  params: Promise<{
    slug: string
    courseId: string
  }>
}

export default async function PublicCoursePage({ params }: PublicCoursePageProps) {
  const resolvedParams = await params
  const course = await getCourseByIdForPublic(resolvedParams.courseId, resolvedParams.slug)

  if (!course) {
    notFound()
  }

  return <CoursePageClient course={course} slug={resolvedParams.slug} />
}
