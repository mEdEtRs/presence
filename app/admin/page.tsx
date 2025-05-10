"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrGenerator } from "../components/qr-generator"
import { AttendanceStats } from "../components/attendance-stats"
import { UserManagement } from "../components/user-management"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Download, RefreshCw } from "lucide-react"
import { getCurrentUser } from "../services/auth-service"
import {
  getAllAttendances,
  resetAllAttendances,
  exportAttendancesToCSV,
  markAbsencesForToday,
} from "../services/attendance-service"
import { getAllStudents } from "../services/user-service"
import { getAllCourses } from "../services/course-service"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [attendances, setAttendances] = useState<any[]>([])
  const [courseFilter, setCourseFilter] = useState("all")
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [markAbsencesDialogOpen, setMarkAbsencesDialogOpen] = useState(false)
  const [selectedCourseForAbsences, setSelectedCourseForAbsences] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [isMarkingAbsences, setIsMarkingAbsences] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.role === "Administrateur") {
      setIsAdmin(true)
    } else {
      window.location.href = "/"
    }

    // Charger les données
    const loadData = async () => {
      try {
        // Récupérer les présences
        const allAttendances = await getAllAttendances()
        setAttendances(allAttendances)

        // Récupérer les cours
        const allCourses = await getAllCourses()
        setCourses(allCourses)

        // Récupérer les étudiants
        const allStudents = await getAllStudents()
        setStudents(allStudents)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      }
    }

    loadData()

    // Mettre à jour les présences toutes les 5 secondes (pour la démo)
    const interval = setInterval(async () => {
      const updatedAttendances = await getAllAttendances()
      setAttendances(updatedAttendances)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleResetAttendances = async () => {
    setIsResetting(true)
    try {
      await resetAllAttendances()
      setAttendances([])
      setResetDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des présences:", error)
    } finally {
      setIsResetting(false)
    }
  }

  const handleMarkAbsences = async () => {
    if (!selectedCourseForAbsences) return

    setIsMarkingAbsences(true)
    try {
      const studentIds = students.map((student) => student.id)
      await markAbsencesForToday(selectedCourseForAbsences, studentIds)

      // Rafraîchir les présences
      const updatedAttendances = await getAllAttendances()
      setAttendances(updatedAttendances)

      setMarkAbsencesDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors du marquage des absences:", error)
    } finally {
      setIsMarkingAbsences(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = exportAttendancesToCSV()
    if (!csvContent) return

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `presences_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredAttendances =
    courseFilter === "all" ? attendances : attendances.filter((a) => a.courseId === courseFilter)

  // Compter les absences par étudiant et par cours
  const getAbsenceCount = (studentId: string, courseId: string) => {
    return attendances.filter((a) => a.userId === studentId && a.courseId === courseId && a.status === "absent").length
  }

  // Vérifier si un étudiant a plus de 7 absences dans un cours
  const needsRetake = (studentId: string, courseId: string) => {
    const absenceCount = getAbsenceCount(studentId, courseId)
    return absenceCount >= 7
  }

  if (!isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>Vous n'avez pas les droits d'accès à cette page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Retour à l'application
        </Button>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="qr">Générer QR Codes</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
          <TabsTrigger value="attendance">Présences en temps réel</TabsTrigger>
        </TabsList>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>Générateur de QR Codes</CardTitle>
              <CardDescription>Créez des QR codes pour les cours et événements</CardDescription>
            </CardHeader>
            <CardContent>
              <QrGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de présence</CardTitle>
              <CardDescription>Visualisez les statistiques de présence</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceStats />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Gérez les comptes utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Présences en temps réel</CardTitle>
                <CardDescription>Suivez les présences enregistrées en temps réel</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-4 w-4" />
                      Réinitialiser
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Réinitialiser toutes les présences</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir réinitialiser toutes les présences ? Cette action est irréversible.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button variant="destructive" onClick={handleResetAttendances} disabled={isResetting}>
                        {isResetting ? "Réinitialisation..." : "Réinitialiser"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={markAbsencesDialogOpen} onOpenChange={setMarkAbsencesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Marquer absences
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Marquer les absences</DialogTitle>
                      <DialogDescription>
                        Marquer comme absents tous les étudiants qui n'ont pas enregistré leur présence aujourd'hui pour
                        le cours sélectionné.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={selectedCourseForAbsences} onValueChange={setSelectedCourseForAbsences}>
                        <SelectTrigger>
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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setMarkAbsencesDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleMarkAbsences} disabled={isMarkingAbsences || !selectedCourseForAbsences}>
                        {isMarkingAbsences ? "Traitement..." : "Marquer les absences"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par cours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les cours</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredAttendances.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucune présence enregistrée pour le moment
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Étudiant</TableHead>
                          <TableHead>Cours</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Absences</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendances.map((attendance, index) => {
                          const absenceCount = getAbsenceCount(attendance.userId, attendance.courseId)
                          const requiresRetake = needsRetake(attendance.userId, attendance.courseId)

                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{attendance.userName}</TableCell>
                              <TableCell>{attendance.courseName}</TableCell>
                              <TableCell>{new Date(attendance.timestamp).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {attendance.status === "present" ? (
                                  <Badge className="bg-green-100 text-green-800">Présent</Badge>
                                ) : attendance.status === "late" ? (
                                  <Badge className="bg-yellow-100 text-yellow-800">En retard</Badge>
                                ) : (
                                  <Badge variant="destructive">Absent</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={requiresRetake ? "text-red-600 font-bold" : ""}>{absenceCount}</span>
                                  {requiresRetake && (
                                    <div className="flex items-center text-red-600">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span className="text-xs font-medium">Rattrapage</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
