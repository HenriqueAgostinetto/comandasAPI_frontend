// Henrique Agostinetto Piva
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import PixIcon from '@mui/icons-material/Pix';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const PIX_KEY = 'Henrique Agostinetto Piva';

export default function CaixaRecebimento() {
  const location = useLocation();
  const navigate = useNavigate();
  const ids = useMemo(() => location.state?.ids || [], [location.state]);
  const [detalhes, setDetalhes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [desconto, setDesconto] = useState('0');
  const [acrescimo, setAcrescimo] = useState('0');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!ids.length) return;
    apiService
      .get(API_ENDPOINTS.RECEBIMENTO.DETALHE.replace(':ids', ids.join(',')))
      .then((response) => setDetalhes(response.data || []))
      .catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar a conferencia.'));
  }, [ids]);

  const valorBruto = useMemo(
    () => detalhes.reduce((total, comanda) => total + Number(comanda.total || 0), 0),
    [detalhes],
  );
  const valorFinal = Math.max(
    0,
    valorBruto - Number(desconto || 0) + Number(acrescimo || 0),
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const response = await apiService.post(API_ENDPOINTS.RECEBIMENTO.RECEBER, {
        comanda_ids: ids,
        cliente_id: clienteId ? Number(clienteId) : null,
        desconto: Number(desconto || 0),
        acrescimo: Number(acrescimo || 0),
        forma_pagamento: formaPagamento,
      });
      navigate(`/caixa/comprovante/${response.data.id}`, { replace: true });
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel finalizar o recebimento.');
    } finally {
      setEnviando(false);
    }
  };

  if (!ids.length) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 4 }}>
        <Alert severity="warning">Nenhuma comanda foi selecionada.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/caixa')}>Voltar ao caixa</Button>
      </Box>
    );
  }

  return (
    <Box className="animate-page" sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Recebimento</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Fechando {ids.length} comanda(s) em uma unica operacao.
      </Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          {detalhes.map((comanda) => (
            <Box key={comanda.id} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 900 }}>{comanda.comanda}</Typography>
              <Typography variant="body2">
                {comanda.itens_count} item(ns) · {money.format(comanda.total)}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box component="form" onSubmit={onSubmit}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Forma de pagamento</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={formaPagamento}
              onChange={(_, value) => value && setFormaPagamento(value)}
              sx={{ mb: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
            >
              <ToggleButton value="dinheiro"><PaymentsIcon fontSize="small" sx={{ mr: 0.75 }} />Dinheiro</ToggleButton>
              <ToggleButton value="debito"><CreditCardIcon fontSize="small" sx={{ mr: 0.75 }} />Debito</ToggleButton>
              <ToggleButton value="credito"><CreditCardIcon fontSize="small" sx={{ mr: 0.75 }} />Credito</ToggleButton>
              <ToggleButton value="pix"><PixIcon fontSize="small" sx={{ mr: 0.75 }} />Pix</ToggleButton>
            </ToggleButtonGroup>
            {formaPagamento === 'pix' && (
              <Box sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'success.main', bgcolor: 'action.hover' }}>
                <Typography variant="caption">Cobranca Pix gerada</Typography>
                <Typography sx={{ fontWeight: 900, my: 0.5 }}>{money.format(valorFinal)}</Typography>
                <Typography variant="body2">Chave Pix: {PIX_KEY}</Typography>
                <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => navigator.clipboard?.writeText(PIX_KEY)} sx={{ mt: 1 }}>
                  Copiar chave
                </Button>
              </Box>
            )}
            <TextField
              fullWidth
              label="ID do cliente (opcional)"
              type="number"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Desconto"
              type="number"
              value={desconto}
              onChange={(event) => setDesconto(event.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Acrescimo"
              type="number"
              value={acrescimo}
              onChange={(event) => setAcrescimo(event.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ mb: 2 }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Valor bruto</Typography>
              <Typography>{money.format(valorBruto)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography>Valor final</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {money.format(valorFinal)}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={enviando}
              startIcon={<CheckCircleIcon />}
              sx={{ mt: 2 }}
            >
              {enviando ? 'Processando...' : 'Confirmar recebimento'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
