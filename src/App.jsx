import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/LoginPage'
import Register from './pages/RegisterPage';
import Reset from './pages/PasswordResetPage';
import Dashboard from './pages/admin/DashboardPage';



function App() {

  return (
    //<AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<Reset />} />





        </Routes>
      </BrowserRouter>
    //</AuthProvider>
  )
}

export default App
