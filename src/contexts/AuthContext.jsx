"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext(undefined)

const roleMap = {
  ADMIN: "Administrador",
  ADMI: "Administrador",
  ADMTV: "Administrador",
  USER: "Usuario",
  EVALUADOR: "Evaluador",
  EVALUANDO: "Evaluando",
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar el usuario desde localStorage
  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = authService.getCurrentUser();
      console.group("📦 Cargando usuario desde localStorage");
      console.log("Usuario almacenado:", storedUser);
      console.groupEnd();

      if (storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  // Escuchar cambios en el storage (para sincronizar pestañas)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        console.log("🔄 Storage cambió, recargando usuario...")
        loadUserFromStorage()
      }
    }

    const onAuthChanged = () => {
      console.log("🔄 Evento authChanged detectado, recargando usuario...")
      loadUserFromStorage()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("authChanged", onAuthChanged)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("authChanged", onAuthChanged)
    }
  }, [loadUserFromStorage])

  const login = async (email, password) => {
    try {
      console.group("🔐 Iniciando login");
      const result = await authService.login(email, password);
      console.log("👤 Usuario devuelto por authService:", result.user);

      setUser(result.user);
      window.dispatchEvent(new Event("authChanged"));
      console.groupEnd();
      return result.user;
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("👋 Cerrando sesión...")
    authService.logout()
    setUser(null)

    try {
      window.dispatchEvent(new Event("authChanged"))
    } catch (error) {
      console.error("Error al disparar evento authChanged:", error)
    }
  }

  // Obtener el nombre completo del usuario
  const getFullName = () => {
    if (!user) return "Usuario"

    if (user.nombre && user.apellido) {
      return `${user.nombre} ${user.apellido}`
    }
    if (user.nombre) return user.nombre
    if (user.name) return user.name
    if (user.fullName) return user.fullName
    if (user.fullname) return user.fullname

    return "Usuario"
  }

  // Obtener el email del usuario
  const getUserEmail = () => {
    if (!user) return ""
    return user.email || ""
  }

  // Obtener el label del rol
  const getRoleLabel = () => {
    if (!user) return "Usuario"

    // Buscar el rol en diferentes propiedades posibles
    const userRole = user.rol || user.role || user.tipo || ""

    console.log("🏷️ Rol detectado:", userRole)

    // Convertir a mayúsculas para comparar
    const roleUpper = userRole.toUpperCase()

    // Buscar en el mapa
    if (roleMap[roleUpper]) {
      return roleMap[roleUpper]
    }

    // Si no está en el mapa, devolver el rol tal cual o Usuario por defecto
    return userRole || (user.isAdmin ? "Administrador" : "Usuario")
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    roleLabel: getRoleLabel(),
    fullName: getFullName(),
    userEmail: getUserEmail(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return ctx
}