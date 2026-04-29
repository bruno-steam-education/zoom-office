import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import OfficeMap from './pages/map/OfficeMap';
import MyReservations from './pages/reservations/MyReservations';
import FloorPlans from './pages/admin/FloorPlans';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="planta/escritorio" element={<OfficeMap />} />
            <Route path="minhas-reservas" element={<MyReservations />} />
            <Route path="admin/plantas" element={<FloorPlans />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
