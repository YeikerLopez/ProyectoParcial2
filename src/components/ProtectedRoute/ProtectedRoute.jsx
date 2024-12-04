import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return null;  // O un componente de loading, mientras esperamos la carga del usuario
  }

  if (!user) {
    return <Navigate to="/login" replace />;  // Redirige al login si no hay usuario
  }

  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/" replace />;  // Redirige si el tipo de usuario no está permitido
  }

  return children;  // Si todo está bien, renderiza los hijos (la ruta protegida)
};

export default ProtectedRoute;
