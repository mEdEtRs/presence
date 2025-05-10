"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Download, Loader2 } from "lucide-react"

export function QrGenerator() {
  const [courseName, setCourseName] = useState("")
  const [courseId, setCourseId] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [duration, setDuration] = useState("60")
  const [generating, setGenerating] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!courseName || !courseId || !date) return

    setGenerating(true)

    // Simuler la génération d'un QR code
    setTimeout(() => {
      // Dans une application réelle, cela serait un appel API au backend
      // qui générerait un QR code contenant les informations du cours
      const qrData = {
        courseId,
        courseName,
        date: date.toISOString(),
        duration: Number.parseInt(duration),
        token: Math.random().toString(36).substring(2, 15),
      }

      // Utiliser un service de QR code en ligne pour la démo
      const qrCodeData = encodeURIComponent(JSON.stringify(qrData))
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`

      setQrCodeUrl(qrUrl)
      setGenerating(false)
    }, 1500)
  }

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `qr-${courseId}-${format(date || new Date(), "yyyy-MM-dd")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courseId">ID du cours</Label>
          <Input
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="ex: INFO101"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseName">Nom du cours</Label>
          <Input
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="ex: Introduction à l'informatique"
          />
        </div>

        <div className="space-y-2">
          <Label>Date du cours</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Durée (minutes)</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Sélectionner une durée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 heure</SelectItem>
              <SelectItem value="90">1 heure 30</SelectItem>
              <SelectItem value="120">2 heures</SelectItem>
              <SelectItem value="180">3 heures</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={!courseName || !courseId || !date || generating} className="w-full">
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            "Générer le QR Code"
          )}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center">
        {generating ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-center text-muted-foreground">Génération du QR code...</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-xs p-4 mb-4">
              <CardContent className="p-0 flex justify-center">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
              </CardContent>
            </Card>
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Remplissez le formulaire et cliquez sur "Générer le QR Code"</p>
            <p className="mt-2">Le QR code apparaîtra ici</p>
          </div>
        )}
      </div>
    </div>
  )
}
