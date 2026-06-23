// Henrique Agostinetto Piva
import { useContext, useEffect, useState } from 'react';
import { Alert, Box, Button, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { API_ENDPOINTS } from '../config/apiConfig';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';

const initialForm = { nome: '', matricula: '', cpf: '', telefone: '', grupo: 2, senha: '' };
const grupos = { 1: 'Administrador', 2: 'Atendimento', 3: 'Caixa' };

export default function Funcionarios() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(initialForm);
  const [funcionarios, setFuncionarios] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const response = await apiService.get(API_ENDPOINTS.FUNCIONARIO.LIST);
    setFuncionarios(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    apiService.get(API_ENDPOINTS.FUNCIONARIO.LIST)
      .then((response) => setFuncionarios(Array.isArray(response.data) ? response.data : []))
      .catch((error) => setErro(error.apiMessage || 'Nao foi possivel carregar os funcionarios.'));
  }, []);

  const alterar = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const excluir = async (funcionario) => {
    if (funcionario.id === user?.id) {
      setErro('O funcionario conectado nao pode excluir a propria conta.');
      return;
    }
    if (!window.confirm('Excluir o funcionario ' + funcionario.nome + '?')) return;
    setErro('');
    try {
      await apiService.delete(API_ENDPOINTS.FUNCIONARIO.DELETE.replace(':id', funcionario.id));
      setSucesso('Funcionario excluido com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel excluir o funcionario.');
    }
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await apiService.post(API_ENDPOINTS.FUNCIONARIO.CREATE, {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
        grupo: Number(form.grupo),
      });
      setForm(initialForm);
      setSucesso('Funcionario cadastrado com sucesso.');
      await carregar();
    } catch (error) {
      setErro(error.apiMessage || 'Nao foi possivel cadastrar o funcionario.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Funcionarios</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={salvar} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Nome completo" required value={form.nome} onChange={alterar('nome')} />
          <TextField label="Matricula" required value={form.matricula} onChange={alterar('matricula')} />
          <TextField label="CPF" required value={form.cpf} onChange={alterar('cpf')} inputProps={{ maxLength: 14 }} />
          <TextField label="Telefone" required value={form.telefone} onChange={alterar('telefone')} />
          <TextField select label="Grupo" required value={form.grupo} onChange={alterar('grupo')}>
            {Object.entries(grupos).map(([id, nome]) => <MenuItem key={id} value={id}>{nome}</MenuItem>)}
          </TextField>
          <TextField label="Senha" type="password" required value={form.senha} onChange={alterar('senha')} />
          <Button type="submit" variant="contained" disabled={salvando} sx={{ minHeight: 48, gridColumn: { md: '1 / -1' } }}>
            {salvando ? 'Salvando...' : 'Cadastrar funcionario'}
          </Button>
        </Box>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1.5 }}>Cadastrados ({funcionarios.length})</Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {funcionarios.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box><Typography fontWeight={800}>{item.nome}</Typography><Typography variant="body2">CPF {item.cpf} | Matricula {item.matricula}</Typography></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={700}>{grupos[item.grupo]}</Typography>
              <Tooltip title={item.id === user?.id ? 'Conta em uso' : 'Excluir funcionario'}>
                <span><IconButton color="error" disabled={item.id === user?.id} onClick={() => excluir(item)}><DeleteOutlineIcon /></IconButton></span>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
