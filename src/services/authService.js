import api from "../api/Axios"

export const authService = {
  // Login sin token
  async login(email, password) {
    try {
      console.group("🔐 authService.login");
      console.log("Credenciales:", { email, password });
      
      const response = await api.post("/auth/login", { email, password });
      console.log("✅ Respuesta del backend:", response.data);
      
      const { data } = response;
      
      // Verificar que tenemos datos de usuario
      if (!data) {
        throw new Error("Respuesta de login inválida: sin datos");
      }
      
      // Buscar datos de usuario
      let userData = data.user || data.usuario || data;
      
      // Validar datos mínimos
      if (!userData.id || !userData.email) {
        throw new Error("Respuesta de login inválida: datos de usuario incompletos");
      }
      
      // ⚠️ NO hay token, solo guardamos el usuario
      localStorage.setItem("user", JSON.stringify(userData));
      
      console.log("✅ Login exitoso, usuario:", userData);
      console.groupEnd();
      
      return { user: userData };
      
    } catch (error) {
      console.error("❌ Error en authService.login:", error);
      console.groupEnd();
      
      if (error.response) {
        throw error.response.data || { message: "Error del servidor" };
      } else if (error.request) {
        throw { message: "Error de conexión. Verifica tu internet." };
      } else {
        throw error;
      }
    }
  },

  // Registro
  async register(userData) {
    try {
      console.log("📝 Registrando usuario...")
      const response = await api.post("/auth/register", userData)
      console.log("Usuario registrado:", response.data)
      return response.data
    } catch (error) {
      console.error("Error en registro:", error)
      throw error.response?.data || { message: "Error de conexión" }
    }
  },

  // 🆕 SOLICITAR recuperación de contraseña (envía email)
  async resetPassword(email) {
    console.group("🔧 authService.resetPassword");
    try {
      console.log("📧 Email recibido:", email);
      console.log("🔄 Preparando petición...");
      
      // ENVIAR CON EL NOMBRE CORRECTO
      const requestData = { correo: email };
      console.log("📤 Datos a enviar:", requestData);
      console.log("🌐 Endpoint: /auth/forgot-password");
      
      const response = await api.post("/auth/forgot-password", requestData);
      
      console.log("✅ Respuesta del servidor - Status:", response.status);
      console.log("📨 Datos de respuesta:", response.data);
      console.groupEnd();
      
      return response.data;
    } catch (error) {
      console.error("❌ Error en authService.resetPassword:");
      console.log("🔍 Detalles del error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      console.groupEnd();
      
      throw error.response?.data || { message: "Error de conexión" };
    }
  },

  // 🆕 CONFIRMAR/CAMBIAR contraseña (con token)
  async changePassword(token, newPassword) {
    console.group("🔧 authService.changePassword");
    try {
      console.log("🔑 Token recibido:", token);
      console.log("🔄 Preparando petición...");
      
      // Enviar los datos que el backend espera
      const requestData = {
        token: token,
        newPassword: newPassword
      };
      
      console.log("📤 Datos a enviar:", requestData);
      console.log("🌐 Endpoint: /auth/reset-password");
      
      const response = await api.post("/auth/reset-password", requestData);
      
      console.log("✅ Respuesta del servidor - Status:", response.status);
      console.log("📨 Datos de respuesta:", response.data);
      console.groupEnd();
      
      return response.data;
    } catch (error) {
      console.error("❌ Error en authService.changePassword:");
      console.log("🔍 Detalles del error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      console.groupEnd();
      
      throw error.response?.data || { message: "Error de conexión" };
    }
  },

  // Verificar autenticación (sin token)
  async verifyAuth() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      
      return { valid: true, user };
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  // Logout
  logout() {
    console.log("👋 Cerrando sesión...")
    try {
      localStorage.removeItem("user")
      window.dispatchEvent(new Event("authChanged"))
      console.log("✅ Sesión cerrada")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  },

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return null

      const user = JSON.parse(userStr)
      console.log("👤 Usuario actual:", user)
      return user
    } catch (error) {
      console.error("Error al parsear usuario:", error)
      localStorage.removeItem("user")
      return null
    }
  },

  // Verificar si está autenticado (sin token)
  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!(user && user.id && user.email);
  },

  // Actualizar datos del usuario en localStorage
  updateUser(updatedUserData) {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        throw new Error("No hay usuario logueado")
      }

      const newUserData = { ...currentUser, ...updatedUserData }
      localStorage.setItem("user", JSON.stringify(newUserData))
      window.dispatchEvent(new Event("authChanged"))
      console.log("✅ Usuario actualizado:", newUserData)
      return newUserData
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      throw error
    }
  },
}