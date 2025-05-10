// Service de gestion des présences

import { getCourseNameById } from "./course-service"

export interface Attendance {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  date: string // Format YYYY-MM-DD
  timestamp: string
  status: "present" | "late" | "absent"
}

export interface Course {
  id: string
  name: string
  teacher: string
  schedule: string
  room: string
}

// Simuler l'enregistrement d'une présence
export const recordAttendance = async (
  qrData: string,
  userId: string,
  userName: string,
  courseId: string,
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Extraire les données du QR code
        const [prefix, scannedCourseId, timestamp, signature] = qrData.split("_")

        // Vérifier la validité du QR code (dans une implémentation réelle)
        if (prefix !== "QR" || !scannedCourseId) {
          resolve({ success: false, message: "QR code invalide" })
          return
        }

        // Vérifier que le cours scanné correspond au cours sélectionné
        if (scannedCourseId !== courseId) {
          resolve({
            success: false,
            message: `Ce QR code est pour un autre cours (${getCourseNameById(scannedCourseId)}). Veuillez scanner le QR code correspondant à ${getCourseNameById(courseId)}.`,
          })
          return
        }

        // Déterminer le nom du cours en fonction de l'ID
        const courseName = getCourseNameById(courseId)

        // Déterminer le statut (présent ou en retard)
        const now = new Date()
        const courseStartTime = new Date()
        courseStartTime.setHours(10, 0, 0) // Supposons que le cours commence à 10h00

        const status: "present" | "late" =
          now.getTime() - courseStartTime.getTime() > 15 * 60 * 1000 ? "late" : "present"

        // Formater la date (YYYY-MM-DD)
        const today = now.toISOString().split("T")[0]

        // Créer l'objet de présence
        const attendance: Attendance = {
          id: Math.random().toString(36).substring(2, 9),
          userId,
          userName,
          courseId,
          courseName,
          date: today,
          timestamp: now.toISOString(),
          status,
        }

        // Récupérer les présences existantes ou initialiser un tableau vide
        const existingAttendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")

        // Vérifier si l'utilisateur a déjà enregistré sa présence pour ce cours aujourd'hui
        const alreadyRecorded = existingAttendances.some(
          (a) => a.userId === userId && a.courseId === courseId && a.date === today,
        )

        if (alreadyRecorded) {
          resolve({ success: false, message: "Vous avez déjà enregistré votre présence pour ce cours aujourd'hui" })
          return
        }

        // Ajouter la nouvelle présence
        existingAttendances.push(attendance)

        // Sauvegarder dans localStorage
        localStorage.setItem("attendances", JSON.stringify(existingAttendances))

        // Envoyer une notification (simulée)
        sendAttendanceNotification(attendance)

        resolve({
          success: true,
          message:
            status === "present" ? "Présence enregistrée avec succès" : "Présence enregistrée avec succès (en retard)",
        })
      } catch (error) {
        resolve({ success: false, message: "Une erreur est survenue lors de l'enregistrement de la présence" })
      }
    }, 1500)
  })
}

// Simuler la récupération des présences d'un utilisateur
export const getUserAttendances = async (userId: string): Promise<Attendance[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allAttendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")
      const userAttendances = allAttendances.filter((a) => a.userId === userId)
      resolve(userAttendances)
    }, 1000)
  })
}

// Simuler la récupération de toutes les présences
export const getAllAttendances = async (): Promise<Attendance[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allAttendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")
      resolve(allAttendances)
    }, 1000)
  })
}

// Récupérer les absences par cours pour un utilisateur
export const getUserAbsencesByCourse = async (userId: string): Promise<Record<string, number>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allAttendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")
      const userAttendances = allAttendances.filter((a) => a.userId === userId)

      // Compter les absences par cours
      const absencesByCourse: Record<string, number> = {}

      // Initialiser les compteurs pour tous les cours
      const courseIds = ["DEVOPS", "DEVSEC", "SECARCH", "DEVMOB", "CRYPTO"]
      courseIds.forEach((courseId) => {
        absencesByCourse[courseId] = 0
      })

      // Compter les absences
      userAttendances.forEach((attendance) => {
        if (attendance.status === "absent") {
          absencesByCourse[attendance.courseId] = (absencesByCourse[attendance.courseId] || 0) + 1
        }
      })

      resolve(absencesByCourse)
    }, 1000)
  })
}

// Réinitialiser toutes les présences
export const resetAllAttendances = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem("attendances")
      resolve(true)
    }, 1000)
  })
}

// Marquer les absences pour tous les étudiants qui n'ont pas enregistré leur présence aujourd'hui
export const markAbsencesForToday = async (courseId: string, studentIds: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Récupérer les présences existantes
        const existingAttendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")

        // Date d'aujourd'hui au format YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0]

        // Récupérer les étudiants qui ont déjà enregistré leur présence aujourd'hui pour ce cours
        const presentStudentIds = existingAttendances
          .filter((a) => a.courseId === courseId && a.date === today)
          .map((a) => a.userId)

        // Déterminer les étudiants absents
        const absentStudentIds = studentIds.filter((id) => !presentStudentIds.includes(id))

        // Récupérer les informations des étudiants absents
        const students = JSON.parse(localStorage.getItem("users") || "[]")

        // Créer des enregistrements d'absence pour chaque étudiant absent
        const now = new Date()
        const absenceRecords: Attendance[] = absentStudentIds.map((studentId) => {
          const student = students.find((s: any) => s.id === studentId) || { name: "Étudiant inconnu" }
          return {
            id: Math.random().toString(36).substring(2, 9),
            userId: studentId,
            userName: student.name,
            courseId,
            courseName: getCourseNameById(courseId),
            date: today,
            timestamp: now.toISOString(),
            status: "absent",
          }
        })

        // Ajouter les absences aux présences existantes
        const updatedAttendances = [...existingAttendances, ...absenceRecords]

        // Sauvegarder dans localStorage
        localStorage.setItem("attendances", JSON.stringify(updatedAttendances))

        resolve(true)
      } catch (error) {
        console.error("Erreur lors du marquage des absences:", error)
        resolve(false)
      }
    }, 1500)
  })
}

// Simuler l'envoi d'une notification
const sendAttendanceNotification = (attendance: Attendance) => {
  // Dans une implémentation réelle, cela pourrait être un appel à une API de notifications
  // Pour la démo, nous stockons simplement la notification dans localStorage
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  notifications.push({
    id: Math.random().toString(36).substring(2, 9),
    type: "attendance",
    title: "Présence enregistrée",
    message: `Présence enregistrée pour ${attendance.courseName}`,
    timestamp: new Date().toISOString(),
    read: false,
    userId: attendance.userId,
  })

  localStorage.setItem("notifications", JSON.stringify(notifications))
}

// Exporter les données de présence au format CSV
export const exportAttendancesToCSV = (): string => {
  const attendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")

  if (attendances.length === 0) {
    return ""
  }

  // Créer l'en-tête CSV
  const headers = ["ID", "Nom", "Cours", "Date", "Heure", "Statut"]

  // Créer les lignes de données
  const rows = attendances.map((a) => {
    const date = new Date(a.timestamp)
    return [
      a.userId,
      a.userName,
      a.courseName,
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      a.status === "present" ? "Présent" : a.status === "late" ? "En retard" : "Absent",
    ]
  })

  // Combiner l'en-tête et les lignes
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return csvContent
}

// Exporter les données de présence au format JSON
export const exportAttendancesToJSON = (): string => {
  const attendances: Attendance[] = JSON.parse(localStorage.getItem("attendances") || "[]")
  return JSON.stringify(attendances, null, 2)
}
