// Simulation d'un service de notifications

export interface Notification {
  id: string
  type: "attendance" | "absence" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  userId: string
}

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")
      const userNotifications = allNotifications.filter((n) => n.userId === userId)
      resolve(userNotifications)
    }, 500)
  })
}

// Marquer une notification comme lue
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((n) => {
    if (n.id === notificationId) {
      return { ...n, read: true }
    }
    return n
  })

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}

// Marquer toutes les notifications d'un utilisateur comme lues
export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((n) => {
    if (n.userId === userId) {
      return { ...n, read: true }
    }
    return n
  })

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}

// Créer une notification
export const createNotification = (notification: Omit<Notification, "id">): void => {
  const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")

  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 9),
  }

  notifications.push(newNotification)
  localStorage.setItem("notifications", JSON.stringify(notifications))
}

// Supprimer une notification
export const deleteNotification = (notificationId: string): void => {
  const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")
  const updatedNotifications = notifications.filter((n) => n.id !== notificationId)
  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}

// Compter les notifications non lues
export const countUnreadNotifications = (userId: string): number => {
  const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]")
  return notifications.filter((n) => n.userId === userId && !n.read).length
}
