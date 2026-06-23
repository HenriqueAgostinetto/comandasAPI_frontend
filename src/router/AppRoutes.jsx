// Henrique Agostinetto Piva
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, lazy, Suspense } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Funcionarios = lazy(() => import('../pages/Funcionarios'));
const Produtos = lazy(() => import('../pages/Produtos'));

const PrivateRoute = ({ children }) => {
  const { isAuth } = useContext(AuthContext);
  return isAuth ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/funcionarios" element={<PrivateRoute><Funcionarios /></PrivateRoute>} />
          <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
          {}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
