// Service de gestion des utilisateurs

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "inactive"
}

// Récupérer tous les utilisateurs
export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      if (users.length === 0) {
        // Si aucun utilisateur n'est enregistré, créer des utilisateurs par défaut
        const defaultUsers: User[] = [
          {
            id: "1",
            name: "Mohammed Ettarrass",
            email: "mohammed.ettarrass@ensaj.ma",
            role: "student",
            status: "active",
          },
          { id: "2", name: "Tebraoui Samy", email: "tebraoui.samy@ensaj.ma", role: "student", status: "active" },
          { id: "3", name: "Kandid Ilyass", email: "kandid.ilyass@ensaj.ma", role: "student", status: "active" },
          { id: "4", name: "Youssef Benali", email: "youssef.benali@ensaj.ma", role: "student", status: "active" },
          { id: "5", name: "Prof Mr Assad", email: "prof.assad@ensaj.ma", role: "teacher", status: "active" },
          { id: "6", name: "Admin ENSAJ", email: "admin@ensaj.ma", role: "admin", status: "active" },
        ]
        localStorage.setItem("users", JSON.stringify(defaultUsers))
        resolve(defaultUsers)
      } else {
        resolve(users)
      }
    }, 500)
  })
}

// Récupérer un utilisateur par son ID
export const getUserById = async (userId: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: User) => u.id === userId) || null
      resolve(user)
    }, 300)
  })
}

// Récupérer tous les étudiants
export const getAllStudents = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const students = users.filter((u: User) => u.role === "student" && u.status === "active")
      resolve(students)
    }, 500)
  })
}

// Ajouter un nouvel utilisateur
export const addUser = async (user: Omit<User, "id">): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const newUser: User = {
        ...user,
        id: (users.length + 1).toString(),
      }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      resolve(newUser)
    }, 1000)
  })
}

// Mettre à jour le statut d'un utilisateur
export const updateUserStatus = async (userId: string, status: "active" | "inactive"): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((u: User) => {
        if (u.id === userId) {
          return { ...u, status }
        }
        return u
      })
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      resolve(true)
    }, 500)
  })
}
