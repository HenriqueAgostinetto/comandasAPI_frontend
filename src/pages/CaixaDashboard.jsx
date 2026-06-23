// Henrique Agostinetto Piva
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function CaixaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [comandas, setComandas] = useState([]);
  const [selecionadas, setSelecionadas] = useState(() => {
    const ids = location.state?.selected;
    return Array.isArray(ids) ? ids : [];
  });
  const [busca, setBusca] = useState('');
  const [detalhes, setDetalhes] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDashboard = async () => {
    setLoading(true);
    setErro('');
    try {
      const [dashboardResponse, recebimentosResponse] = await Promise.all([
        apiService.get(API_ENDPOINTS.RECEBIMENTO.DASHBOARD),
        apiService.get(API_ENDPOINTS.RECEBIMENTO.LIST),
      ]);
      setComandas(Array.isArray(dashboardResponse.data) ? dashboardResponse.data : []);
      setRecebimentos(Array.isArray(recebimentosResponse.data) ? recebimentosResponse.data : []);
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel carregar as comandas abertas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      apiService.get(API_ENDPOINTS.RECEBIMENTO.DASHBOARD),
      apiService.get(API_ENDPOINTS.RECEBIMENTO.LIST),
    ])
      .then(([dashboardResponse, recebimentosResponse]) => {
        if (!active) return;
        setComandas(Array.isArray(dashboardResponse.data) ? dashboardResponse.data : []);
        setRecebimentos(Array.isArray(recebimentosResponse.data) ? recebimentosResponse.data : []);
      })
      .catch((error) => {
        if (active) setErro(error.apiMessage || 'Nao foi possivel carregar as comandas abertas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selecionadas.length) return undefined;

    let active = true;
    apiService
      .get(API_ENDPOINTS.RECEBIMENTO.DETALHE.replace(':ids', selecionadas.join(',')))
      .then((response) => {
        if (active) setDetalhes(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        if (active) setErro(error.apiMessage || 'Nao foi possivel detalhar as comandas.');
      });
    return () => {
      active = false;
    };
  }, [selecionadas]);

  const alternarSelecao = (id) => {
    setSelecionadas((atual) => (
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    ));
  };

  const excluirRecebimento = async (recebimento) => {
    if (!window.confirm('Excluir o recebimento #' + recebimento.id + ' e reabrir suas comandas?')) return;
    setErro('');
    try {
      await apiService.delete(API_ENDPOINTS.RECEBIMENTO.DELETE.replace(':id', recebimento.id));
      setSelecionadas([]);
      await carregarDashboard();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel excluir o recebimento.');
    }
  };

  const selecionarPorBusca = (event) => {
    event.preventDefault();
    const termo = busca.trim().toLowerCase();
    const encontrada = comandas.find((item) => (
      String(item.id) === termo || item.comanda.toLowerCase() === termo
    ));

    if (!encontrada) {
      setErro('Comanda aberta nao encontrada pelo numero ou nome informado.');
      return;
    }

    if (!selecionadas.includes(encontrada.id)) {
      setSelecionadas((atual) => [...atual, encontrada.id]);
    }
    setErro('');
    setBusca('');
  };

  const totalSelecionado = useMemo(
    () => comandas
      .filter((item) => selecionadas.includes(item.id))
      .reduce((total, item) => total + Number(item.total || 0), 0),
    [comandas, selecionadas],
  );

  const detalhesVisiveis = selecionadas.length ? detalhes : [];
  const quantidadeItens = detalhesVisiveis.reduce(
    (total, comanda) => total + (comanda.itens?.length || 0),
    0,
  );

  return (
    <Box className="animate-page" sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Caixa</Typography>
          <Typography variant="body2">
            Selecione uma ou mais comandas abertas e confira os itens antes de receber.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontWeight: 800 }}>Henrique Piva</Typography>
            <Typography variant="caption">Operador responsavel</Typography>
          </Box>
          <Avatar
            src="/henriqueagostinettopiva.png"
            alt="Henrique Piva"
            sx={{ width: 56, height: 56 }}
          />
        </Box>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <Box component="form" onSubmit={selecionarPorBusca} sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Numero ou nome da comanda"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
        <Button type="submit" variant="contained">Selecionar</Button>
        <Button
          variant="outlined"
          onClick={() => setSelecionadas(comandas.map((comanda) => comanda.id))}
          disabled={comandas.length < 2}
        >
          Selecionar todas
        </Button>
        <Button onClick={carregarDashboard} title="Atualizar comandas" sx={{ minWidth: 44 }}>
          <RefreshIcon />
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(340px, .75fr)' },
          gap: 3,
        }}
      >
        <Box>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 260 }}>
              <CircularProgress />
            </Box>
          ) : comandas.length === 0 ? (
            <Alert severity="info">Nao existem comandas abertas.</Alert>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {comandas.map((comanda) => {
                const marcada = selecionadas.includes(comanda.id);
                return (
                  <Card
                    key={comanda.id}
                    variant="outlined"
                    onClick={() => alternarSelecao(comanda.id)}
                    sx={{
                      cursor: 'pointer',
                      borderColor: marcada ? 'var(--accent-blue)' : 'var(--border-main)',
                      borderWidth: marcada ? 2 : 1,
                    }}
                  >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{comanda.comanda}</Typography>
                        <Typography variant="body2">
                          {comanda.cliente?.nome || 'Cliente nao identificado'}
                        </Typography>
                        <Typography variant="caption">{comanda.itens_count} item(ns)</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Checkbox checked={marcada} readOnly />
                        <Typography sx={{ fontWeight: 900 }}>{money.format(comanda.total)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Conferencia</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selecionadas.length} comanda(s), {quantidadeItens} item(ns)
            </Typography>
            {selecionadas.length > 1 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {selecionadas.length} comandas serao recebidas em uma unica operacao.
              </Alert>
            )}
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ maxHeight: 430, overflow: 'auto' }}>
              {detalhesVisiveis.length === 0 ? (
                <Typography variant="body2">
                  Selecione uma comanda para visualizar os produtos consumidos.
                </Typography>
              ) : detalhesVisiveis.map((comanda) => (
                <Box key={comanda.id} sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>{comanda.comanda}</Typography>
                  {comanda.itens.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '44px 1fr auto',
                        gap: 1.5,
                        alignItems: 'center',
                        py: 0.75,
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={item.produto?.foto || undefined}
                        alt={item.produto?.nome || 'Produto'}
                        sx={{ width: 44, height: 44, borderRadius: 1 }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {item.produto?.nome || `Produto #${item.produto_id}`}
                        </Typography>
                        <Typography variant="caption">
                          {item.quantidade} x {money.format(item.valor_unitario)}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800 }}>{money.format(item.valor_total)}</Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total bruto</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {money.format(totalSelecionado)}
              </Typography>
            </Box>
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={!selecionadas.length}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/caixa/receber', { state: { ids: selecionadas } })}
            >
              Iniciar recebimento
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>Recebimentos</Typography>
        <Box sx={{ display: 'grid', gap: 1 }}>
          {recebimentos.map((recebimento) => (
            <Paper key={recebimento.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>Recebimento #{recebimento.id}</Typography>
                <Typography variant="body2">{new Date(recebimento.data_hora).toLocaleString('pt-BR')} | {recebimento.comanda_ids.length} comanda(s)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 900 }}>{money.format(recebimento.valor_total)}</Typography>
                <Tooltip title="Excluir recebimento"><IconButton color="error" onClick={() => excluirRecebimento(recebimento)}><DeleteOutlineIcon /></IconButton></Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
