import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Reset from './pages/PasswordResetPage';
import AdminLayout from './layouts/AdminLayout';
import EvaluadorLayout from './layouts/EvaluadorLayout';
import EvaluandoLayout from './layouts/EvaluandoLayout';
import Editar from './pages/ProfileEditPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<Reset />} />

        {/* Rutas de Administrador */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Rutas de Evaluador */}
        <Route path="/evaluador/*" element={<EvaluadorLayout />} />

        {/* Rutas de Evaluando */}
        <Route path="/evaluando/*" element={<EvaluandoLayout />} />

        <Route path="/edit-profile" element={<Editar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;