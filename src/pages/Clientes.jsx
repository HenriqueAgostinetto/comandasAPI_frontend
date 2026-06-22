import { useEffect, useState } from 'react';
import { Alert, Box, Button, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { API_ENDPOINTS } from '../config/apiConfig';
import { apiService } from '../services/api';

const initialForm = { nome: '', cpf: '', telefone: '' };

export default function Clientes() {
  const [form, setForm] = useState(initialForm);
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const response = await apiService.get(API_ENDPOINTS.CLIENTE.LIST);
    setClientes(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    apiService.get(API_ENDPOINTS.CLIENTE.LIST)
      .then((response) => setClientes(Array.isArray(response.data) ? response.data : []))
      .catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar os clientes.'));
  }, []);

  const alterar = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const excluir = async (cliente) => {
    if (!window.confirm('Excluir o cliente ' + cliente.nome + '?')) return;
    setErro('');
    try {
      await apiService.delete(API_ENDPOINTS.CLIENTE.DELETE.replace(':id', cliente.id));
      setSucesso('Cliente excluido com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel excluir o cliente.');
    }
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await apiService.post(API_ENDPOINTS.CLIENTE.CREATE, {
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
      });
      setForm(initialForm);
      setSucesso('Cliente cadastrado com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel cadastrar o cliente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Clientes</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={salvar} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
          <TextField label="Nome completo" required value={form.nome} onChange={alterar('nome')} />
          <TextField label="CPF" required value={form.cpf} onChange={alterar('cpf')} inputProps={{ maxLength: 14 }} />
          <TextField label="Telefone" required value={form.telefone} onChange={alterar('telefone')} />
          <Button type="submit" variant="contained" disabled={salvando} sx={{ minHeight: 48, gridColumn: { md: '1 / -1' } }}>
            {salvando ? 'Salvando...' : 'Cadastrar cliente'}
          </Button>
        </Box>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1.5 }}>Cadastrados ({clientes.length})</Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {clientes.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box><Typography fontWeight={800}>{item.nome}</Typography><Typography variant="body2">CPF {item.cpf} | Telefone {item.telefone}</Typography></Box>
            <Tooltip title="Excluir cliente"><IconButton color="error" onClick={() => excluir(item)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
