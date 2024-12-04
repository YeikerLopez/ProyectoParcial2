import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch(user.type) {
      case 'student':
        return <li><Link to="/student-dashboard">Dashboard Estudiante</Link></li>;
      case 'tutor':
        return <li><Link to="/tutor-dashboard">Dashboard Tutor</Link></li>;
      case 'company':
        return <li><Link to="/company-dashboard">Dashboard Empresa</Link></li>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Barra superior */}
      <div className="div-top"></div>
      
      {/* Navbar principal */}
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/Logo1.png" alt="" />
          </Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">Inicio</Link></li>
          {getDashboardLink()}
        </ul>
        <div className="navbar-auth">
          {user ? (
            <>
              <span>Bienvenido, {user.name}</span>
              <button onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login">Iniciar Sesión</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;