// Henrique Agostinetto Piva
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Container, CssBaseline } from '@mui/material';

export default function PageLayout() {
  const { isAuth } = useAuth();

  if (!isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}
