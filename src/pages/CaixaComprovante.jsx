import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Divider, Paper, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const paymentLabels = { dinheiro: 'Dinheiro', debito: 'Debito', credito: 'Credito', pix: 'Pix' };

export default function CaixaComprovante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comprovante, setComprovante] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    apiService
      .get(API_ENDPOINTS.RECEBIMENTO.COMPROVANTE.replace(':id', id))
      .then((response) => setComprovante(response.data || null))
      .catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar o comprovante.'));
  }, [id]);

  if (erro) return <Alert severity="error" sx={{ m: 4 }}>{erro}</Alert>;
  if (!comprovante) return <Typography sx={{ p: 4 }}>Carregando comprovante...</Typography>;

  return (
    <Box className="animate-page" sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper sx={{ p: 3, width: '100%', maxWidth: 520, fontFamily: 'monospace', boxShadow: 3 }}>
        <Typography align="center" variant="h6" fontWeight="bold">COMANDAS DO ZE</Typography>
        <Typography align="center" variant="caption" display="block">
          Comprovante de recebimento #{comprovante.id}
        </Typography>
        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

        <Typography variant="body2">
          Data: {new Date(comprovante.data_hora).toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="body2">Caixa: {comprovante.funcionario?.nome}</Typography>
        <Typography variant="body2">Pagamento: {paymentLabels[comprovante.forma_pagamento] || comprovante.forma_pagamento}</Typography>
        {comprovante.cliente && (
          <Typography variant="body2">Cliente: {comprovante.cliente.nome}</Typography>
        )}

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        <Typography variant="body2" fontWeight="bold">ITENS CONSUMIDOS</Typography>

        {comprovante.comandas.map((comanda) => (
          <Box key={comanda.id} sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              Comanda: {comanda.comanda}
            </Typography>
            {comanda.itens.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto',
                  gap: 1,
                  alignItems: 'center',
                  py: 0.5,
                }}
              >
                <Avatar
                  variant="rounded"
                  src={item.produto?.foto || undefined}
                  sx={{ width: 32, height: 32, borderRadius: 1 }}
                />
                <Typography variant="body2">
                  {item.produto?.nome || `Produto #${item.produto_id}`} x{item.quantidade}
                </Typography>
                <Typography variant="body2">{money.format(item.valor_total)}</Typography>
              </Box>
            ))}
          </Box>
        ))}

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Subtotal:</Typography>
          <Typography variant="body2">{money.format(comprovante.valor_bruto)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Desconto:</Typography>
          <Typography variant="body2">{money.format(comprovante.desconto)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Acrescimo:</Typography>
          <Typography variant="body2">{money.format(comprovante.acrescimo)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body1" fontWeight="bold">TOTAL PAGO:</Typography>
          <Typography variant="body1" fontWeight="bold">
            {money.format(comprovante.valor_total)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        <Typography align="center" variant="body2">
          Pagamento concluido. Obrigado pela preferencia.
        </Typography>
      </Paper>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        startIcon={<ReceiptLongIcon />}
        onClick={() => navigate('/caixa')}
      >
        Voltar ao caixa
      </Button>
    </Box>
  );
}
