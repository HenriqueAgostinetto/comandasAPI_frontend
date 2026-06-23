// Henrique Agostinetto Piva
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Funcionarios from './pages/Funcionarios';
import Comandas from './pages/Comandas';
import CaixaDashboard from './pages/CaixaDashboard';
import CaixaRecebimento from './pages/CaixaRecebimento';
import CaixaComprovante from './pages/CaixaComprovante';
import NotFound from './pages/NotFound';
import Navbar from './components/common/Navbar';
import { Box } from '@mui/material';
function PrivateRoute({ children }) {
  const { authenticated } = useContext(AuthContext);
  return authenticated ? children : <Navigate to="/" />;
}

function PrivateLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <Navbar />
      <Outlet />
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<PrivateRoute><PrivateLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/comandas" element={<Comandas />} />
        <Route path="/caixa" element={<CaixaDashboard />} />
        <Route path="/caixa/receber" element={<CaixaRecebimento />} />
        <Route path="/caixa/comprovante/:id" element={<CaixaComprovante />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
