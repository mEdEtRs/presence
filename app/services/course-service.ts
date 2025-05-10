// Service de gestion des cours

export interface Course {
  id: string
  name: string
  teacher: string
  schedule: string
  room: string
}

// Liste des cours disponibles
const availableCourses: Course[] = [
  {
    id: "DEVOPS",
    name: "DevOps",
    teacher: "Prof. Assad",
    schedule: "Lundi 10:00-12:00",
    room: "Salle A101",
  },
  {
    id: "DEVSEC",
    name: "Dev&Sec",
    teacher: "Prof. Benali",
    schedule: "Mardi 14:00-16:00",
    room: "Salle B202",
  },
  {
    id: "SECARCH",
    name: "Sec&Architecture IT",
    teacher: "Prof. Chakir",
    schedule: "Mercredi 08:00-10:00",
    room: "Salle C303",
  },
  {
    id: "DEVMOB",
    name: "DevMobile",
    teacher: "Prof. Dounia",
    schedule: "Jeudi 16:00-18:00",
    room: "Salle D404",
  },
  {
    id: "CRYPTO",
    name: "Cryptographie",
    teacher: "Prof. El Mahdi",
    schedule: "Vendredi 13:00-15:00",
    room: "Salle E505",
  },
]

// Récupérer tous les cours
export const getAllCourses = async (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(availableCourses)
    }, 500)
  })
}

// Récupérer un cours par son ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = availableCourses.find((c) => c.id === courseId) || null
      resolve(course)
    }, 300)
  })
}

// Récupérer le nom d'un cours par son ID
export const getCourseNameById = (courseId: string): string => {
  const course = availableCourses.find((c) => c.id === courseId)
  return course ? course.name : "Cours inconnu"
}
