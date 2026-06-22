import { useState, useContext, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Swal from 'sweetalert2';

export default function Login() {
  const navigate = useNavigate();
  const { login, authenticated, loading } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const userRef = useRef(null);

  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, loading, navigate]);

  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl && rootEl.getAttribute('aria-hidden') === 'true') {
      rootEl.removeAttribute('aria-hidden');
    }
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        title: 'Atenção',
        text: 'Preencha todos os campos.',
        icon: 'warning',
        confirmButtonColor: '#2c3e50'
      });
      return;
    }

    const success = await login(username, password);

    if (success) {
      Swal.fire({
        title: 'Sucesso!',
        text: 'Autenticação realizada com sucesso.',
        icon: 'success',
        confirmButtonColor: '#2c3e50'
      }).then(() => {
        document.getElementById('root')?.removeAttribute('aria-hidden');
        navigate('/dashboard');
      });
    } else {
      Swal.fire({
        title: 'Erro de Acesso',
        text: 'Usuário ou senha inválidos.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      }).then(() => {
        setTimeout(() => {
          document.getElementById('root')?.removeAttribute('aria-hidden');
          userRef.current?.focus();
        }, 100);
      });
    }
  };

  if (loading) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1a252f',
        px: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: '380px',
          borderRadius: '4px',
          bgcolor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#f39c12',
            width: 56,
            height: 56,
            mb: 2
          }}
        >
          <RestaurantIcon sx={{ fontSize: 28, color: '#ffffff' }} />
        </Avatar>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            color: '#2c3e50',
            mb: 1,
            fontSize: '1.8rem'
          }}
        >
          Comandas do Zé
        </Typography>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: '#7f8c8d',
            mb: 4
          }}
        >
          Faça login para acessar o sistema
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            inputRef={userRef}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="CPF"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            slotProps={{
              htmlInput: {
                maxLength: 11
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f1f2f6',
                borderRadius: '4px'
              }
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              htmlInput: {
                maxLength: 32
              }
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f1f2f6',
                borderRadius: '4px'
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#2c3e50 !important',
              color: '#ffffff !important',
              fontWeight: 600,
              py: 1.5,
              borderRadius: '4px',
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#34495e !important' }
            }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
