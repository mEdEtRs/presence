"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, UserCheck, UserX, Clock } from "lucide-react"

export function AttendanceStats() {
  const [loading, setLoading] = useState(true)
  const [courseFilter, setCourseFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("week")

  // Données fictives pour la démo
  const stats = {
    totalStudents: 120,
    presentToday: 98,
    absentToday: 22,
    lateToday: 15,
    presentRate: 81.7,
    courses: [
      { id: "DEVOPS101", name: "DevOps", presentRate: 85 },
      { id: "DEVSEC202", name: "Dev&sec", presentRate: 78 },
      { id: "SECARCHI103", name: "Sec&architecture IT", presentRate: 92 },
      { id: "DEVMOBILE104", name: "Dev Mobile", presentRate: 75 },
    ],
  }

  useEffect(() => {
    // Simuler un chargement des données
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }, [courseFilter, periodFilter])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {stats.courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-1/2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="semester">Ce semestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Étudiants inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">{stats.presentRate}% de présence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentToday}</div>
            <p className="text-xs text-muted-foreground">{(100 - stats.presentRate).toFixed(1)}% d'absence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lateToday}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.lateToday / stats.totalStudents) * 100).toFixed(1)}% en retard
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Graphique</TabsTrigger>
          <TabsTrigger value="courses">Par cours</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Taux de présence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Graphique de présence (simulé)</p>
                {/* Dans une application réelle, nous utiliserions une bibliothèque comme Chart.js ou Recharts */}
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Graphique de présence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Présence par cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.courses.map((course) => (
                  <div key={course.id} className="flex items-center">
                    <div className="w-1/3 font-medium truncate">{course.name}</div>
                    <div className="w-2/3">
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${course.presentRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{course.presentRate}% présents</span>
                        <span>{100 - course.presentRate}% absents</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
