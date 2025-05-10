"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { recordAttendance } from "../services/attendance-service"

interface QrScannerProps {
  userId: string
  userName: string
  courseId: string
  courseName: string
}

export function QrScanner({ userId, userName, courseId, courseName }: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attendanceRecorded, setAttendanceRecorded] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "late" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleScan = async (data: string) => {
    if (data && !scanned) {
      setScanned(true)
      setScanning(false)
      setLoading(true)
      setError(null)

      try {
        const result = await recordAttendance(data, userId, userName, courseId)

        if (result.success) {
          setAttendanceRecorded(true)
          setAttendanceStatus(result.message.includes("en retard") ? "late" : "present")

          toast({
            title: "Succès!",
            description: result.message,
          })
        } else {
          setError(result.message)
          toast({
            title: "Erreur",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        setError("Une erreur est survenue lors de l'enregistrement de la présence")
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'enregistrement de la présence",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const startScanning = () => {
    setScanning(true)
    setScanned(false)
    setAttendanceRecorded(false)
    setAttendanceStatus(null)
    setError(null)

    // Simuler un scan réussi après 3 secondes
    setTimeout(() => {
      handleScan(`QR_${courseId}_${new Date().toISOString()}_signature`)
    }, 3000)
  }

  return (
    <div className="flex flex-col items-center">
      {scanning ? (
        <div className="relative w-full max-w-sm aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-primary/50 rounded-lg animate-pulse"></div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Positionnez le QR code dans le cadre</p>
            <Button variant="outline" onClick={() => setScanning(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : scanned ? (
        <Card className="w-full max-w-sm p-6 flex flex-col items-center justify-center mb-4">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">Enregistrement de votre présence...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center font-medium text-red-500">Erreur</p>
              <p className="text-center text-muted-foreground text-sm mt-1">{error}</p>
              <Button onClick={startScanning} className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center font-medium">Présence enregistrée avec succès!</p>
              <p className="text-center text-muted-foreground text-sm mt-1">{new Date().toLocaleString()}</p>
              {attendanceRecorded && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Votre présence a été enregistrée pour le cours:</p>
                  <Badge
                    className={
                      attendanceStatus === "late" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }
                  >
                    {courseName} {attendanceStatus === "late" && "(En retard)"}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <div className="w-full max-w-sm aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
          <p className="text-center text-muted-foreground">Appuyez sur le bouton ci-dessous pour scanner un QR code</p>
        </div>
      )}

      <Button onClick={startScanning} disabled={scanning || loading} className="w-full max-w-sm">
        {scanning ? "Scan en cours..." : "Scanner un QR code"}
      </Button>
    </div>
  )
}
