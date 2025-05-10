// Simulation d'un service d'authentification avec JWT

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthResponse {
  user: User
  token: string
  success: boolean
  message?: string
}

// Simuler le stockage des tokens JWT
export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token)
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token")
}

export const removeAuthToken = () => {
  localStorage.removeItem("auth_token")
}

// Simuler la vérification du token JWT
export const isTokenValid = (): boolean => {
  const token = getAuthToken()
  if (!token) return false

  try {
    // Dans une implémentation réelle, nous vérifierions la validité du JWT
    // Pour la démo, nous vérifions simplement si le token existe
    return true
  } catch (error) {
    return false
  }
}

// Simuler l'authentification avec JWT
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Simuler un appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Utilisateurs prédéfinis pour la démo
      const predefinedUsers = [
        { id: "1", email: "mohammed.ettarrass@ensaj.ma", name: "Mohammed Ettarrass", role: "Étudiant" },
        { id: "2", email: "admin@ensaj.ma", name: "Administrateur ENSAJ", role: "Administrateur" },
        { id: "3", email: "prof@ensaj.ma", name: "Professeur ENSAJ", role: "Enseignant" },
        { id: "4", email: "etudiant@ensaj.ma", name: "Étudiant ENSAJ", role: "Étudiant" },
      ]

      // Vérifier si l'email correspond à un utilisateur prédéfini
      const user = predefinedUsers.find((user) => user.email === email)

      if (user && password) {
        // Générer un token JWT simulé
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            exp: Date.now() + 3600000, // Expiration dans 1 heure
          }),
        )}.signature`

        setAuthToken(token)

        resolve({
          user,
          token,
          success: true,
        })
      } else if (email && password) {
        // Fallback pour d'autres emails (pour la démo)
        const role = email.includes("admin") ? "Administrateur" : email.includes("prof") ? "Enseignant" : "Étudiant"

        const newUser = {
          id: "999",
          name: email.split("@")[0],
          email,
          role,
        }

        // Générer un token JWT simulé
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            exp: Date.now() + 3600000, // Expiration dans 1 heure
          }),
        )}.signature`

        setAuthToken(token)

        resolve({
          user: newUser,
          token,
          success: true,
        })
      } else {
        resolve({
          user: {} as User,
          token: "",
          success: false,
          message: "Email ou mot de passe incorrect",
        })
      }
    }, 1000)
  })
}

export const logout = (): void => {
  removeAuthToken()
}

export const getCurrentUser = (): User | null => {
  const token = getAuthToken()
  if (!token) return null

  try {
    // Décoder le token JWT simulé
    const payload = JSON.parse(atob(token.split(".")[1]))

    // Vérifier si le token a expiré
    if (payload.exp < Date.now()) {
      removeAuthToken()
      return null
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    return null
  }
}
