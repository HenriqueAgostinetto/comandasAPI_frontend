import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/apiConfig';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Comandas() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [comandas, setComandas] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const [comandasResponse, clientesResponse, produtosResponse] = await Promise.all([
      apiService.get(API_ENDPOINTS.RECEBIMENTO.DASHBOARD),
      apiService.get(API_ENDPOINTS.CLIENTE.LIST),
      apiService.get(API_ENDPOINTS.PRODUTO.LIST),
    ]);
    setComandas(Array.isArray(comandasResponse.data) ? comandasResponse.data : []);
    setClientes(Array.isArray(clientesResponse.data) ? clientesResponse.data : []);
    setProdutos(Array.isArray(produtosResponse.data) ? produtosResponse.data : []);
  };

  useEffect(() => {
    Promise.all([
      apiService.get(API_ENDPOINTS.RECEBIMENTO.DASHBOARD),
      apiService.get(API_ENDPOINTS.CLIENTE.LIST),
      apiService.get(API_ENDPOINTS.PRODUTO.LIST),
    ]).then(([comandasResponse, clientesResponse, produtosResponse]) => {
      setComandas(Array.isArray(comandasResponse.data) ? comandasResponse.data : []);
      setClientes(Array.isArray(clientesResponse.data) ? clientesResponse.data : []);
      setProdutos(Array.isArray(produtosResponse.data) ? produtosResponse.data : []);
    }).catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar os dados das comandas.'));
  }, []);

  const total = useMemo(() => produtos.reduce(
    (soma, produto) => soma + Number(produto.valor_unitario) * Number(quantidades[produto.id] || 0),
    0,
  ), [produtos, quantidades]);

  const alterarQuantidade = (produtoId, valor) => {
    setQuantidades((atual) => ({ ...atual, [produtoId]: Math.max(0, Number(valor) || 0) }));
  };

  const excluirComanda = async (comanda) => {
    if (!window.confirm('Excluir a comanda ' + comanda.comanda + ' e seus itens?')) return;
    setErro('');
    try {
      const itensResponse = await apiService.get(API_ENDPOINTS.COMANDA.LIST_ITEMS.replace(':id', comanda.id));
      await Promise.all((itensResponse.data || []).map((item) => (
        apiService.delete(API_ENDPOINTS.COMANDA.REMOVE_ITEM.replace(':id', item.id))
      )));
      await apiService.delete(API_ENDPOINTS.COMANDA.DELETE.replace(':id', comanda.id));
      setSucesso('Comanda excluida com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel excluir a comanda.');
    }
  };

  const abrirComanda = async (event) => {
    event.preventDefault();
    const itens = produtos.filter((produto) => Number(quantidades[produto.id]) > 0);
    if (!itens.length) {
      setErro('Adicione pelo menos um produto consumido.');
      return;
    }
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.COMANDA.CREATE, {
        comanda: numero.trim(), status: 0,
        cliente_id: clienteId ? Number(clienteId) : null,
        funcionario_id: user.id,
      });
      await Promise.all(itens.map((produto) => apiService.post(
        API_ENDPOINTS.COMANDA.ADD_ITEM.replace(':id', response.data.id),
        {
          produto_id: produto.id,
          funcionario_id: user.id,
          quantidade: Number(quantidades[produto.id]),
          valor_unitario: Number(produto.valor_unitario),
        },
      )));
      setNumero('');
      setClienteId('');
      setQuantidades({});
      setSucesso(`Comanda aberta com total de ${money.format(total)}.`);
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel abrir a comanda.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Comandas</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>Abra a comanda com todos os produtos consumidos.</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={abrirComanda} sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Numero ou nome da comanda" required value={numero} onChange={(event) => setNumero(event.target.value)} />
            <TextField select label="Cliente (opcional)" value={clienteId} onChange={(event) => setClienteId(event.target.value)}>
              <MenuItem value="">Sem cliente identificado</MenuItem>
              {clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome} - {cliente.cpf}</MenuItem>)}
            </TextField>
          </Box>
          <Typography variant="h6" fontWeight={800}>Produtos consumidos</Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {produtos.map((produto) => (
              <Box key={produto.id} sx={{ display: 'grid', gridTemplateColumns: '1fr auto 100px', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                <Box><Typography fontWeight={700}>{produto.nome}</Typography><Typography variant="caption">{produto.descricao}</Typography></Box>
                <Typography>{money.format(produto.valor_unitario)}</Typography>
                <TextField label="Qtd." type="number" size="small" value={quantidades[produto.id] || ''} onChange={(event) => alterarQuantidade(produto.id, event.target.value)} inputProps={{ min: 0, step: 1 }} />
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight={900}>Total: {money.format(total)}</Typography>
            <Button type="submit" variant="contained" disabled={salvando || total <= 0} sx={{ minHeight: 48 }}>{salvando ? 'Abrindo...' : 'Abrir comanda'}</Button>
          </Box>
        </Box>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6">Abertas ({comandas.length})</Typography>
        <Button variant="outlined" onClick={() => navigate('/caixa')}>Ir para o caixa</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {comandas.map((comanda) => (
          <Paper key={comanda.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box><Typography fontWeight={800}>{comanda.comanda}</Typography><Typography variant="body2">{comanda.cliente?.nome || 'Cliente nao identificado'} | {comanda.itens_count} item(ns)</Typography></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontWeight={900}>{money.format(comanda.total)}</Typography>
              <Tooltip title="Excluir comanda"><IconButton color="error" onClick={() => excluirComanda(comanda)}><DeleteOutlineIcon /></IconButton></Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
