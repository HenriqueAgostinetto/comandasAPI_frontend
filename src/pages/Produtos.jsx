import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const initialForm = { nome: '', descricao: '', valor_unitario: '', foto: null };
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Produtos() {
  const [form, setForm] = useState(initialForm);
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const response = await apiService.get(API_ENDPOINTS.PRODUTO.LIST);
    setProdutos(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    apiService.get(API_ENDPOINTS.PRODUTO.LIST)
      .then((response) => setProdutos(Array.isArray(response.data) ? response.data : []))
      .catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar os produtos.'));
  }, []);

  const alterar = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  const selecionarFoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((atual) => ({ ...atual, foto: String(reader.result).split(',')[1] }));
    reader.readAsDataURL(file);
  };

  const excluir = async (produto) => {
    if (!window.confirm('Excluir o produto ' + produto.nome + '?')) return;
    setErro('');
    try {
      await apiService.delete(API_ENDPOINTS.PRODUTO.DELETE.replace(':id', produto.id));
      setSucesso('Produto excluido com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel excluir o produto.');
    }
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await apiService.post(API_ENDPOINTS.PRODUTO.CREATE, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        valor_unitario: Number(String(form.valor_unitario).replace(',', '.')),
        foto: form.foto,
      });
      setForm(initialForm);
      setSucesso('Produto cadastrado com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel cadastrar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Produtos</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={salvar} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Nome" required value={form.nome} onChange={alterar('nome')} />
          <TextField label="Valor unitario" required type="number" inputProps={{ min: 0.01, step: 0.01 }} value={form.valor_unitario} onChange={alterar('valor_unitario')} />
          <TextField label="Descricao" required multiline minRows={2} value={form.descricao} onChange={alterar('descricao')} sx={{ gridColumn: { md: '1 / -1' } }} />
          <Button component="label" variant="outlined">Selecionar foto<input hidden type="file" accept="image/*" onChange={selecionarFoto} /></Button>
          <Button type="submit" variant="contained" disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar produto'}</Button>
        </Box>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1.5 }}>Cadastrados ({produtos.length})</Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {produtos.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" src={item.foto || undefined}>{item.nome?.[0]}</Avatar>
            <Box sx={{ flex: 1 }}><Typography fontWeight={800}>{item.nome}</Typography><Typography variant="body2">{item.descricao}</Typography></Box>
            <Typography fontWeight={900}>{money.format(item.valor_unitario)}</Typography>
            <Tooltip title="Excluir produto"><IconButton color="error" onClick={() => excluir(item)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
