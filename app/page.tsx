"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrScanner } from "./components/qr-scanner"
import { LoginForm } from "./components/login-form"
import { AttendanceHistory } from "./components/attendance-history"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { NotificationBell } from "./components/notification-bell"
import { getCurrentUser, logout } from "./services/auth-service"
import { CourseSelector } from "./components/course-selector"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null)
  const [currentCourse, setCurrentCourse] = useState({ id: "", name: "" })
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser({
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      })
      setIsLoggedIn(true)
    }

    // Vérifier si l'appareil est mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleLogin = (userData: { id: string; name: string; role: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
    toast({
      title: "Connexion réussie",
      description: `Bienvenue, ${userData.name}!`,
    })
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setIsLoggedIn(false)
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    })
  }

  const handleCourseSelect = (courseId: string, courseName: string) => {
    setCurrentCourse({ id: courseId, name: courseName })
  }

  if (!isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous pour enregistrer votre présence</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onLogin={handleLogin} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold`}>Système de Présence ENSAJ</h1>
        <div className="flex items-center gap-2">
          {user && <NotificationBell userId={user.id} />}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que: <strong>{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>

      {user?.role === "Administrateur" ? (
        <div className="mb-4">
          <Button onClick={() => (window.location.href = "/admin")} className="w-full">
            Accéder au tableau de bord administrateur
          </Button>
        </div>
      ) : null}

      {/* Sélecteur de cours */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sélection du cours</CardTitle>
          <CardDescription>Choisissez le cours pour lequel vous souhaitez enregistrer votre présence</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseSelector onCourseSelect={handleCourseSelect} />
        </CardContent>
      </Card>

      {user?.role === "Étudiant" && currentCourse.id && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cours actuel</CardTitle>
            <CardDescription>Informations sur votre cours actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Cours:</span>
                <span>{currentCourse.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Code:</span>
                <span>{currentCourse.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Horaire:</span>
                <span>{new Date().toLocaleDateString()} - 10:00 à 12:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Statut:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  En attente de présence
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner QR Code</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>Scanner un QR Code</CardTitle>
              <CardDescription>Scannez le QR code pour enregistrer votre présence</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCourse.id ? (
                <QrScanner
                  userId={user?.id || ""}
                  userName={user?.name || ""}
                  courseId={currentCourse.id}
                  courseName={currentCourse.name}
                />
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Veuillez sélectionner un cours avant de scanner un QR code
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique de présence</CardTitle>
              <CardDescription>Consultez votre historique de présence</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceHistory userId={user?.id || ""} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
