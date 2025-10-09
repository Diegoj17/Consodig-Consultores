import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import PasswordReset from './components/auth/PasswordReset'


function App() {

  return (
    //<AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<PasswordReset />} />

        </Routes>
      </BrowserRouter>
    //</AuthProvider>
  )
}

export default App
