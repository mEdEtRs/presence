"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import { getUserAttendances, getUserAbsencesByCourse } from "../services/attendance-service"
import { getAllCourses } from "../services/course-service"

interface AttendanceRecord {
  id: string
  courseId: string
  courseName: string
  date: string
  timestamp: string
  status: "present" | "late" | "absent"
}

interface AttendanceHistoryProps {
  userId: string
}

export function AttendanceHistory({ userId }: AttendanceHistoryProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [absencesByCourse, setAbsencesByCourse] = useState<Record<string, number>>({})
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    // Récupérer l'historique des présences
    const fetchHistory = async () => {
      if (!userId) return

      setLoading(true)

      try {
        // Récupérer les présences de l'utilisateur
        const attendances = await getUserAttendances(userId)

        // Récupérer les absences par cours
        const absences = await getUserAbsencesByCourse(userId)

        // Récupérer tous les cours
        const allCourses = await getAllCourses()

        // Transformer les données pour l'affichage
        const formattedRecords = attendances.map((attendance) => ({
          id: attendance.id,
          courseId: attendance.courseId,
          courseName: attendance.courseName,
          date: new Date(attendance.date).toLocaleDateString(),
          timestamp: attendance.timestamp,
          status: attendance.status,
        }))

        setRecords(formattedRecords)
        setAbsencesByCourse(absences)
        setCourses(allCourses)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId])

  const getStatusBadge = (status: "present" | "absent" | "late") => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Présent</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      case "late":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-800">
            En retard
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Résumé des absences par cours */}
      <div className="rounded-md border p-4">
        <h3 className="text-lg font-medium mb-4">Résumé des absences</h3>
        <div className="space-y-4">
          {courses.map((course) => {
            const absenceCount = absencesByCourse[course.id] || 0
            const isWarning = absenceCount >= 5 && absenceCount < 7
            const isDanger = absenceCount >= 7

            return (
              <div key={course.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{course.name}:</span>
                  <span
                    className={`${isDanger ? "text-red-600 font-bold" : isWarning ? "text-yellow-600 font-medium" : ""}`}
                  >
                    {absenceCount} absence{absenceCount !== 1 ? "s" : ""}
                  </span>
                </div>

                {isDanger && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Rattrapage requis</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tableau détaillé des présences */}
      {records.length === 0 ? (
        <p className="text-center py-6 text-muted-foreground">Aucun historique de présence disponible</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.courseName}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
