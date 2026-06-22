import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

export default function Caixa() {
  const navigate = useNavigate();
  const [comandaId, setComandaId] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [historicoCaixa, setHistoricoCaixa] = useState([]);

  useEffect(() => {
    apiService.get(API_ENDPOINTS.RECEBIMENTO.LIST)
      .then(res => {
        const data = res.data || [];
        const mapped = (data || []).map((r) => ({
          id: r.recebimento?.transacao_id || r.recebimento_id || r.id || Date.now(),
          info: `Recebimento #${r.recebimento?.transacao_id || r.recebimento_id || r.id}`,
          valor: (r.resumo_valores?.valor_final ?? r.valor_final ?? r.recebimento?.valor_final ?? 0),
          tipo: 'Entrada'
        }));
        setHistoricoCaixa(mapped);
      })
      .catch(err => console.error('Erro ao buscar históricos de recebimentos:', err));
  }, []);

  const handleReceber = (e) => {
    e.preventDefault();
    if (!comandaId) return;
    navigate('/recebimento/pagar', { state: { ids: [parseInt(comandaId, 10)] } });
    setComandaId('');
    setValorPago('');
  };

  return (
    <Box className="animate-page" sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.5px' }}>CAIXA / FLUXO</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>Recebimentos de comandas e histórico de transações.</Typography>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 0, mb: 5 }}>
        <Box component="form" onSubmit={handleReceber} sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
          <TextField label="Nº DA COMANDA" fullWidth required value={comandaId} onChange={(e) => setComandaId(e.target.value)} variant="standard" />
          <TextField label="VALOR A RECEBER (R$)" fullWidth required value={valorPago} onChange={(e) => setValorPago(e.target.value)} variant="standard" />
          <Button type="submit" variant="contained" className="click-effect" sx={{ bgcolor: 'var(--accent-blue) !important', color: '#ffffff !important', fontWeight: 800, px: 4, height: '40px', borderRadius: 0, '&:hover': { bgcolor: 'var(--accent-green) !important' } }}>
            RECEBER
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {historicoCaixa.map((mov) => (
          <Box key={mov.id} className="animate-item" sx={{ p: 2.5, border: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{mov.info}</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'var(--color-success-animate)' }}>+{mov.tipo}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>
              R$ {mov.valor}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
