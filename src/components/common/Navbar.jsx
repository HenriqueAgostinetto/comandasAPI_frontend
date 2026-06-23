// Henrique Agostinetto Piva
import { useState, useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Comandas', path: '/comandas' },
    { label: 'Caixa', path: '/caixa' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Produtos', path: '/produtos' },
    { label: 'Funcionários', path: '/funcionarios' }
  ];

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-main)', boxShadow: 'none', backgroundImage: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography
            onClick={() => navigate('/dashboard')}
            className="click-effect"
            sx={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px', cursor: 'pointer', textTransform: 'uppercase', color: 'var(--text-main)' }}
          >
            Zé<span style={{ color: 'var(--accent-blue)' }}>.</span>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="nav-link-animated click-effect"
                sx={{
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 0,
                  px: 0.5,
                  minWidth: 'auto',
                  '&:hover': { color: 'var(--accent-blue)', bgcolor: 'transparent' }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} className="click-effect">
            {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </IconButton>

          <Avatar
            onClick={handleOpenMenu}
            src="/henriqueagostinettopiva.png"
            className="click-effect"
            sx={{
              width: 38, height: 38,
              border: '2px solid var(--border-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'var(--accent-blue)' }
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            slotProps={{
              paper: {
                elevation: 10,
                sx: {
                  mt: 1.5, p: 2, minWidth: '240px', borderRadius: 0,
                  bgcolor: 'var(--bg-surface)', border: '1px solid var(--border-main)',
                  '&::before': {
                    content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10,
                    bgcolor: 'var(--bg-surface)', transform: 'translateY(-50%) rotate(45deg)',
                    borderLeft: '1px solid var(--border-main)', borderTop: '1px solid var(--border-main)',
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar src="/henriqueagostinettopiva.png" sx={{ width: 45, height: 45, border: '1px solid var(--border-main)' }} />
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                   {user?.nome || 'Henrique Piva'}
                </Typography>
                <Chip
                  label={user?.cargo || 'Administrador'}
                  size="small"
                  sx={{ bgcolor: 'var(--color-error)', color: '#fff !important', fontWeight: 900, fontSize: '0.65rem', height: '18px', borderRadius: '2px', mt: 0.5 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2, borderTop: '1px solid var(--border-main)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AssignmentIndIcon sx={{ fontSize: '1.1rem', color: 'var(--accent-blue) !important' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>CPF: {user?.cpf || '1'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BadgeIcon sx={{ fontSize: '1.1rem', color: 'var(--accent-blue) !important' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Matrícula: {user?.matricula || '1'}</Typography>
              </Box>
            </Box>
          </Menu>

          <IconButton
            onClick={() => logout()}
            className="click-effect"
            sx={{ color: 'var(--text-main)', '&:hover': { color: 'var(--color-error)' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
