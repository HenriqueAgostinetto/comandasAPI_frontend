import { Box, Typography, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" color="error" gutterBottom>ERRO 404</Typography>
      <Typography variant="h6" gutterBottom>Página não encontrada, verifique se a rota esta correta!
      </Typography>

      <TextField
        label=""
        variant="outlined"
        sx={{ mt: 2, mb: 4, display: 'block', mx: 'auto' }}
      />

      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        voltar pro inicio
      </Button>
    </Box>
  );
}
