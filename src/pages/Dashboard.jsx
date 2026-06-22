import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Chip, CircularProgress, LinearProgress, Paper, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const paymentLabels = { dinheiro: 'Dinheiro', debito: 'Debito', credito: 'Credito', pix: 'Pix' };

export default function Dashboard() {
  const [abertas, setAbertas] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      apiService.get(API_ENDPOINTS.RECEBIMENTO.DASHBOARD),
      apiService.get(API_ENDPOINTS.RECEBIMENTO.LIST),
      apiService.get(API_ENDPOINTS.PRODUTO.LIST),
    ]).then(([abertasResponse, recebimentosResponse, produtosResponse]) => {
      if (!ativo) return;
      setAbertas(Array.isArray(abertasResponse.data) ? abertasResponse.data : []);
      setRecebimentos(Array.isArray(recebimentosResponse.data) ? recebimentosResponse.data : []);
      setProdutos(Array.isArray(produtosResponse.data) ? produtosResponse.data : []);
    }).catch((error) => {
      if (ativo) setErro(error.apiMessage || 'Nao foi possivel atualizar o dashboard.');
    }).finally(() => {
      if (ativo) setCarregando(false);
    });
    return () => { ativo = false; };
  }, []);

  const faturamento = useMemo(() => recebimentos.reduce((soma, item) => soma + Number(item.valor_total || 0), 0), [recebimentos]);
  const pagamentos = useMemo(() => recebimentos.reduce((totais, item) => {
    const forma = item.forma_pagamento || 'dinheiro';
    totais[forma] = (totais[forma] || 0) + Number(item.valor_total || 0);
    return totais;
  }, {}), [recebimentos]);
  const maiorPagamento = Math.max(1, ...Object.values(pagamentos));
  const recentes = [...recebimentos].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora)).slice(0, 5);
  const stats = [
    { title: 'Valor recebido', value: money.format(faturamento), icon: <AttachMoneyIcon />, color: '#17834b' },
    { title: 'Comandas abertas', value: abertas.length, icon: <ReceiptIcon />, color: '#d14b35' },
    { title: 'Clientes na casa', value: abertas.length, icon: <GroupIcon />, color: '#246ea8' },
    { title: 'Produtos ativos', value: produtos.length, icon: <ShoppingCartIcon />, color: '#b97912' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 14, minHeight: 'calc(100vh - 72px)', position: 'relative', maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 2 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 900 }}>Dashboard operacional</Typography><Typography variant="body2">Movimento da Pastelaria Piva em tempo real</Typography></Box>
        <Chip label={`${abertas.length} em atendimento`} color={abertas.length ? 'success' : 'default'} />
      </Box>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {carregando ? <CircularProgress /> : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((item) => (
              <Paper key={item.title} variant="outlined" sx={{ p: 2.5, minHeight: 118, borderTop: `4px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box><Typography variant="subtitle2" fontWeight={800}>{item.title}</Typography><Typography variant="h5" fontWeight={900} mt={1}>{item.value}</Typography></Box>
                <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', color: item.color, bgcolor: 'action.hover', borderRadius: 1 }}>{item.icon}</Box>
              </Paper>
            ))}
          </Box>

          <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr .9fr' }, gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>Comandas em atendimento</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {abertas.length === 0 && <Typography variant="body2">Nenhuma comanda aberta.</Typography>}
                {abertas.slice(0, 6).map((comanda) => (
                  <Box key={comanda.id} sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box><Typography fontWeight={800}>{comanda.comanda}</Typography><Typography variant="caption">{comanda.cliente?.nome || 'Cliente nao identificado'} | {comanda.itens_count} item(ns)</Typography></Box>
                    <Typography fontWeight={900}>{money.format(comanda.total)}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>Formas de pagamento</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {Object.keys(paymentLabels).map((forma) => (
                  <Box key={forma}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" fontWeight={700}>{paymentLabels[forma]}</Typography><Typography variant="body2">{money.format(pagamentos[forma] || 0)}</Typography></Box>
                    <LinearProgress variant="determinate" value={((pagamentos[forma] || 0) / maiorPagamento) * 100} sx={{ height: 7, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>

          <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={900} mb={2}>Recebimentos recentes</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
              {recentes.map((item) => (
                <Box key={item.id} sx={{ p: 1.5, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box><Typography fontWeight={800}>#{item.id} | {paymentLabels[item.forma_pagamento] || 'Dinheiro'}</Typography><Typography variant="caption">{new Date(item.data_hora).toLocaleString('pt-BR')} | {item.comanda_ids.length} comanda(s)</Typography></Box>
                  <Typography fontWeight={900}>{money.format(item.valor_total)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </>
      )}
      <Box sx={{ position: 'absolute', right: { xs: 16, md: 32 }, bottom: 20, textAlign: 'center' }}>
        <Avatar src="/henriqueagostinettopiva.png" alt="Henrique Agostinetto Piva" sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'divider', ml: 'auto' }} />
        <Typography variant="caption" fontWeight={700}>Henrique Piva</Typography>
      </Box>
    </Box>
  );
}
