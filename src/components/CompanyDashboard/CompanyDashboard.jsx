import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [activeInternships, setActiveInternships] = useState([]);
  const [students, setStudents] = useState([]); // Guardar los estudiantes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener las aplicaciones aprobadas
        const approvedResponse = await fetch(
          `http://localhost:3001/applications?companyId=${user.id}&status=approved`
        );
        const approvedData = await approvedResponse.json();
        setApprovedApplications(approvedData);

        // Obtener las pasantías activas
        const internshipsResponse = await fetch(
          `http://localhost:3001/internships?companyId=${user.id}`
        );
        const internshipsData = await internshipsResponse.json();

        // Obtener los estudiantes asociados a las pasantías
        const studentIds = internshipsData.map((internship) => internship.studentId);
        const uniqueStudentIds = [...new Set(studentIds)];
        
        const studentsResponse = await fetch(
          `http://localhost:3001/users?id=${uniqueStudentIds.join('&id=')}`
        );
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Asociar los estudiantes a las pasantías
        const internshipsWithStudents = internshipsData.map((internship) => {
          const student = studentsData.find(student => student.id === internship.studentId);
          return {
            ...internship,
            studentName: student ? student.name : 'Estudiante no disponible'
          };
        });

        setActiveInternships(internshipsWithStudents);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleInternshipOffer = async (applicationId) => {
    try {
      // Enviar la solicitud para actualizar la aplicación a 'aceptada'
      const applicationResponse = await fetch(`http://localhost:3001/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
        }),
      });
  
      if (!applicationResponse.ok) {
        throw new Error(`Error al actualizar la aplicación: ${applicationResponse.statusText}`);
      }
  
      const updatedApplication = await applicationResponse.json();
      console.log("Aplicación actualizada: ", updatedApplication);  // Log para verificar
  
      // Crear la pasantía
      const internshipResponse = await fetch('http://localhost:3001/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: updatedApplication.id,
          studentId: updatedApplication.studentId,
          companyId: user.id,
          startDate: new Date().toISOString(),
          loggedHours: 0,
          workLog: [],
          status: 'active',
        }),
      });
  
      if (!internshipResponse.ok) {
        throw new Error(`Error al crear la pasantía: ${internshipResponse.statusText}`);
      }
  
      const newInternship = await internshipResponse.json();
      console.log("Pasantía creada: ", newInternship);  // Log para verificar
  
      // Actualizar el estado local de las aplicaciones (si tienes un estado `applications`)
      setApprovedApplications((prevApplications) =>
        prevApplications.filter((application) => application.id !== applicationId)
      );
  
      // Actualizar el estado local de las pasantías (si es necesario)
      setInternships((prevInternships) => [...prevInternships, newInternship]);
  
      alert('Oferta de pasantía enviada exitosamente');
    } catch (error) {
      console.error('Error al procesar la oferta de pasantía:', error);
      alert('Error al procesar la oferta de pasantía');
    }
  };
  

  const handleRejectApplication = async (applicationId) => {
    try {
      // Enviar la solicitud para rechazar la aplicación
      const rejectResponse = await fetch(`http://localhost:3001/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
        }),
      });
  
      // Verificar si la respuesta es exitosa
      if (!rejectResponse.ok) {
        throw new Error(`Error al rechazar la aplicación: ${rejectResponse.statusText}`);
      }
  
      // Eliminar la aplicación rechazada de la lista local
      setApprovedApplications((prevApplications) =>
        prevApplications.filter((application) => application.id !== applicationId)
      );
  
      alert('Aplicación rechazada exitosamente');
    } catch (error) {
      console.error('Error al rechazar la aplicación:', error);
      alert('Hubo un error al rechazar la aplicación. Por favor, inténtelo nuevamente.');
    }
  };
  

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="company-dashboard">
      <h2>Panel de Empresa</h2>
      <p className="welcome-message">Bienvenido, {user.name}</p>

      <div className="dashboard-section">
        <h3>Aplicaciones Aprobadas</h3>
        <div className="applications-list">
          {approvedApplications.length > 0 ? (
            <ul>
              {approvedApplications.map(app => (
                <li key={app.id} className="application-item">
                  <div className="application-header">
                    <h4>{app.studentName}</h4>
                    <span className="approval-info">Aprobado por: {app.tutorName}</span>
                  </div>
                  <div className="curriculum-details">
                    <h5>Información del Estudiante</h5>
                    <div className="curriculum-grid">
                      <div className="curriculum-field">
                        <strong>Estudios:</strong>
                        <p>{app.curriculum.estudios}</p>
                      </div>
                      <div className="curriculum-field">
                        <strong>Experiencia:</strong>
                        <p>{app.curriculum.experiencia}</p>
                      </div>
                      <div className="curriculum-field">
                        <strong>Habilidades:</strong>
                        <p>{app.curriculum.habilidades}</p>
                      </div>
                      <div className="curriculum-field">
                        <strong>Sobre Mí:</strong>
                        <p>{app.curriculum.sobreMi}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleInternshipOffer(app.id)}
                    className="offer-button"
                  >
                    Ofrecer Pasantía
                  </button>
                  <button 
                    onClick={() => handleRejectApplication(app.id)}
                    className="reject-button"
                  >
                    Rechazar Aplicación
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No hay aplicaciones aprobadas pendientes</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Pasantías Activas</h3>
        <div className="internships-list">
          {activeInternships.length > 0 ? (
            <ul>
              {activeInternships.map(internship => (
                <li key={internship.id} className="internship-item">
                  <div className="internship-header">
                    <h4>{internship.studentName || 'Estudiante no disponible'}</h4>
                    <span className="date-info">
                      Inicio: {new Date(internship.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p>
                    <strong>Estudiante:</strong> 
                    {internship.studentName || 'Información no disponible'}
                  </p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(internship.loggedHours / 180) * 100}%` }}
                    ></div>
                    <span className="progress-text">
                      {internship.loggedHours} / 180 horas
                    </span>
                  </div>
                  {internship.workLog && internship.workLog.length > 0 && (
                    <div className="work-log">
                      <h5>Registro de Actividades</h5>
                      <ul className="log-list">
                        {internship.workLog.map((log, index) => (
                          <li key={index} className="log-item">
                            <div className="log-header">
                              <span className="log-date">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <span className="log-hours">{log.hours} horas</span>
                            </div>
                            <p className="log-description">{log.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No hay pasantías activas</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
