"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllCourses } from "../services/course-service"

interface Course {
  id: string
  name: string
  teacher: string
  schedule: string
  room: string
}

interface CourseSelectorProps {
  onCourseSelect: (courseId: string, courseName: string) => void
  defaultCourseId?: string
}

export function CourseSelector({ onCourseSelect, defaultCourseId }: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourseId || "")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const availableCourses = await getAllCourses()
        setCourses(availableCourses)

        if (!selectedCourseId && availableCourses.length > 0) {
          const defaultCourse = availableCourses[0]
          setSelectedCourseId(defaultCourse.id)
          onCourseSelect(defaultCourse.id, defaultCourse.name)
        } else if (selectedCourseId) {
          const course = availableCourses.find((c) => c.id === selectedCourseId)
          if (course) {
            onCourseSelect(course.id, course.name)
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cours:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      onCourseSelect(course.id, course.name)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="course-select">Sélectionner un cours</Label>
      <Select value={selectedCourseId} onValueChange={handleCourseChange} disabled={loading}>
        <SelectTrigger id="course-select">
          <SelectValue placeholder="Sélectionner un cours" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
