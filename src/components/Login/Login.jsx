import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/users?email=${email}`);
      const users = await response.json();

      if (users.length === 0) {
        setError('Usuario no encontrado');
        return;
      }

      const user = users[0];
      if (user.password !== password) {
        setError('Contraseña incorrecta');
        return;
      }

      login(user);
      
      // Redirigir al usuario al dashboard correspondiente
      switch(user.type) {
        case 'student':
          navigate('/student-dashboard');
          break;
        case 'tutor':
          navigate('/tutor-dashboard');
          break;
        case 'company':
          navigate('/company-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;

