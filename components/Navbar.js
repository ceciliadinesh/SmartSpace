import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Import Menu icon
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/llogo.png'; // Adjust the path to your logo image
import { Box } from '@mui/material'; // Import Box for layout

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Dropdown menu handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuOpen(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          SmartSpace Analytics
        </Typography>

        

        {/* Desktop Buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/home">Home</Button>
          <Button color="inherit" onClick={handleMenuClick}>
            Camera Interface
          </Button>
          <Menu
            id="camera-interface-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/camera-interface" onClick={handleMenuClose}>
              People Counting
            </MenuItem>
            <MenuItem component={Link} to="/qr-scanner" onClick={handleMenuClose}>
              QR Scanner
            </MenuItem>
            <MenuItem component={Link} to="/path-tracking" onClick={handleMenuClose}>
              Path Tracking
            </MenuItem>
            <MenuItem component={Link} to="/attendance" onClick={handleMenuClose}>
              Attendance
            </MenuItem>
          </Menu>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
{/* Mobile Menu Icon positioned on the right */}
<IconButton color="inherit" aria-label="open menu" onClick={handleMobileMenuOpen}>
          <MenuIcon />
        </IconButton>
        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuOpen}
          open={Boolean(mobileMenuOpen)}
          onClose={handleMobileMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem component={Link} to="/home" onClick={handleMobileMenuClose}>Home</MenuItem>
          <MenuItem component={Link} to="/camera-interface" onClick={handleMobileMenuClose}>Camera Interface</MenuItem>
          <MenuItem component={Link} to="/qr-scanner" onClick={handleMobileMenuClose}>QR Scanner</MenuItem>
          <MenuItem component={Link} to="/path-tracking" onClick={handleMobileMenuClose}>Path Tracking</MenuItem>
          <MenuItem component={Link} to="/attendance" onClick={handleMobileMenuClose}>Attendance</MenuItem>
          <MenuItem component={Link} to="/dashboard" onClick={handleMobileMenuClose}>Dashboard</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
