import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [pendingApplications, setPendingApplications] = useState([]);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = () => {
    fetch('http://localhost:3001/applications?status=pending')
      .then(response => response.json())
      .then(data => setPendingApplications(data));
  };

  const handleApplicationReview = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3001/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, tutorId: user.id, tutorName: user.name }),
      });

      if (response.ok) {
        alert(`Aplicación ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
        fetchPendingApplications();
      } else {
        throw new Error('Error al actualizar la aplicación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la aplicación');
    }
  };

  return (
    <div className="tutor-dashboard">
      <h2>Panel de Tutor</h2>
      <div className="pending-applications">
        <h3>Aplicaciones Pendientes de Revisión</h3>
        {pendingApplications.length > 0 ? (
          <ul>
            {pendingApplications.map(app => (
              <li key={app.id}>
                <h4>Estudiante: {app.studentName}</h4>
                <p>Empresa: {app.companyName}</p>
                <div className="curriculum">
                  <h5>Currículum:</h5>
                  <p><strong>Nombre:</strong> {app.curriculum.nombre}</p>
                  <p><strong>Estudios:</strong> {app.curriculum.estudios}</p>
                  <p><strong>Experiencia:</strong> {app.curriculum.experiencia}</p>
                  <p><strong>Habilidades:</strong> {app.curriculum.habilidades}</p>
                  <p><strong>Sobre Mí:</strong> {app.curriculum.sobreMi}</p>
                </div>
                <div className="action-buttons">
                  <button onClick={() => handleApplicationReview(app.id, 'approved')}>Aprobar</button>
                  <button onClick={() => handleApplicationReview(app.id, 'rejected')}>Rechazar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay aplicaciones pendientes de revisión.</p>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;

