import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './StudentDashboard.css';

// Constantes para URL de la API y horas requeridas (mejora la legibilidad y mantenimiento)
const API_BASE_URL = 'http://localhost:3001';
const REQUIRED_INTERNSHIP_HOURS = 180;

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeInternship, setActiveInternship] = useState(null);
  const [application, setApplication] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState({
    nombre: '',
    estudios: '',
    experiencia: '',
    habilidades: '',
    sobreMi: '',
  });
  const [selectedCompany, setSelectedCompany] = useState('');
  const [horasTrabajadas, setHorasTrabajadas] = useState('');
  const [descripcionTrabajo, setDescripcionTrabajo] = useState('');
  const [error, setError] = useState(null); // Nuevo estado para manejar errores de forma visible

  // Función para mostrar mensajes al usuario (reemplaza alert)
  const showUserMessage = (message, type = 'info') => {
    // Aquí puedes integrar una librería de toasts (ej. react-toastify)
    // o un modal personalizado para mensajes más amigables.
    // Por ahora, usamos console.log para no modificar la UI directamente.
    console.log(`${type.toUpperCase()}: ${message}`);
    // En una app real, aquí se actualizaría un estado para mostrar un toast/modal
    if (type === 'error') {
      setError(message);
    } else {
      setError(null);
    }
  };

  // useCallback para memorizar fetchData y evitar renders innecesarios
  const fetchData = useCallback(async () => {
    if (!user?.id) { // Asegurarse de que el usuario.id exista antes de buscar datos
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Limpiar errores anteriores

      // 1. Obtener empresas
      const companiesResponse = await fetch(`${API_BASE_URL}/users?type=company`);
      if (!companiesResponse.ok) throw new Error('Error al obtener las empresas.');
      const companiesData = await companiesResponse.json();
      setCompanies(companiesData);

      // 2. Verificar postulaciones existentes
      const applicationResponse = await fetch(
        `${API_BASE_URL}/applications?studentId=${user.id}&_sort=id&_order=desc&_limit=1`
      );
      if (!applicationResponse.ok) throw new Error('Error al obtener la postulación.');
      const applicationData = await applicationResponse.json();
      if (applicationData.length > 0) {
        setApplication(applicationData[0]);
      } else {
        setApplication(null); // Asegurar que no haya aplicación si no se encuentra ninguna
      }

      // 3. Verificar pasantías activas
      const internshipResponse = await fetch(
        `${API_BASE_URL}/internships?studentId=${user.id}&status=active&_expand=application`
      );
      if (!internshipResponse.ok) throw new Error('Error al obtener la pasantía activa.');
      const internshipData = await internshipResponse.json();
      if (internshipData.length > 0) {
        setActiveInternship(internshipData[0]);
      } else {
        setActiveInternship(null); // Asegurar que no haya pasantía activa si no se encuentra ninguna
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      showUserMessage(`Error al cargar los datos: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // user.id es la única dependencia que debe ser verificada

  // Ejecutar fetchData al montar el componente o cuando user.id cambie
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependencia del useCallback

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurriculum((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores antes de enviar

    if (!selectedCompany) {
      showUserMessage('Por favor, seleccione una empresa', 'error');
      return;
    }

    // Validaciones básicas del currículum (puedes añadir más)
    if (!curriculum.nombre || !curriculum.estudios) {
      showUserMessage('Por favor, complete al menos su nombre y estudios.', 'error');
      return;
    }

    try {
      const company = companies.find((c) => c.id === parseInt(selectedCompany));
      if (!company) {
        throw new Error('Empresa seleccionada no válida.');
      }

      const applicationData = {
        studentId: user.id,
        companyId: parseInt(selectedCompany),
        curriculum: curriculum,
        status: 'pending',
        studentName: user.name,
        companyName: company.name, // Acceso más seguro al nombre de la empresa
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la postulación. Por favor, intente de nuevo.');
      }

      const newApplication = await response.json();
      setApplication(newApplication);
      showUserMessage('Postulación enviada con éxito', 'success');
      // Refrescar datos después de una postulación exitosa para asegurar consistencia
      fetchData();
      // Limpiar el formulario
      setCurriculum({
        nombre: '',
        estudios: '',
        experiencia: '',
        habilidades: '',
        sobreMi: '',
      });
      setSelectedCompany('');
    } catch (err) {
      console.error('Error al enviar la postulación:', err);
      showUserMessage(`Error al enviar la postulación: ${err.message}`, 'error');
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores antes de enviar

    if (!activeInternship) {
      showUserMessage('No hay una pasantía activa para registrar horas.', 'error');
      return;
    }

    const hours = parseInt(horasTrabajadas);
    if (isNaN(hours) || hours <= 0 || hours > 24) { // Validación de horas
      showUserMessage('Por favor, ingrese un número válido de horas (1-24).', 'error');
      return;
    }
    if (!descripcionTrabajo.trim()) { // Validación de descripción
      showUserMessage('Por favor, ingrese una descripción del trabajo realizado.', 'error');
      return;
    }

    try {
      const newLogEntry = {
        date: new Date().toISOString(),
        hours: hours,
        description: descripcionTrabajo.trim(), // Eliminar espacios en blanco
      };

      const response = await fetch(
        `${API_BASE_URL}/internships/${activeInternship.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loggedHours: (activeInternship.loggedHours || 0) + hours,
            workLog: [...(activeInternship.workLog || []), newLogEntry],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al registrar las horas. Por favor, intente de nuevo.');
      }

      const updatedInternship = await response.json();
      setActiveInternship(updatedInternship);
      showUserMessage('Horas registradas con éxito', 'success');
      // Limpiar el formulario de horas
      setHorasTrabajadas('');
      setDescripcionTrabajo('');
    } catch (err) {
      console.error('Error al registrar las horas:', err);
      showUserMessage(`Error al registrar las horas: ${err.message}`, 'error');
    }
  };

  if (!user) { // Manejar el caso donde no hay usuario logeado
    return <div className="student-dashboard">Por favor, inicie sesión para ver su panel.</div>;
  }

  if (loading) {
    return <div className="loading">Cargando datos del panel...</div>;
  }

  return (
    <div className="student-dashboard">
      <h2>Panel de Estudiante</h2>

      {error && <div className="error-message">{error}</div>} {/* Mostrar errores aquí */}

      {activeInternship ? (
        <div className="internship-status">
          <h3>Pasantía Activa</h3>
          <div className="status-card">
            <div className="company-info">
              {/* Acceso más seguro al nombre de la empresa asociada a la pasantía */}
              <h4>
                Empresa: {activeInternship.application?.companyName || 'No asignada'}
              </h4>
              <p>
                Fecha de inicio:{' '}
                {activeInternship?.startDate
                  ? new Date(activeInternship.startDate).toLocaleDateString()
                  : 'No disponible'}
              </p>
            </div>
            <div className="hours-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((activeInternship?.loggedHours || 0) / REQUIRED_INTERNSHIP_HOURS) * 100}%`,
                  }}
                ></div>
                <span className="progress-text">
                  {activeInternship?.loggedHours || 0} / {REQUIRED_INTERNSHIP_HOURS} horas
                </span>
              </div>
            </div>
          </div>
          <div className="log-hours-section">
            <h4>Registrar Horas</h4>
            <form onSubmit={handleLogHours} className="log-hours-form">
              <div className="form-group">
                <label htmlFor="horasTrabajadas">Horas Trabajadas:</label>
                <input
                  type="number"
                  id="horasTrabajadas"
                  value={horasTrabajadas}
                  onChange={(e) => setHorasTrabajadas(e.target.value)}
                  min="1"
                  max="24"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcionTrabajo">Descripción del Trabajo:</label>
                <textarea
                  id="descripcionTrabajo"
                  value={descripcionTrabajo}
                  onChange={(e) => setDescripcionTrabajo(e.target.value)}
                  placeholder="Describe las actividades realizadas"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Registrar Horas
              </button>
            </form>
          </div>
        </div>
      ) : application ? (
        <div className="application-status">
          <h3>Estado de tu Postulación</h3>
          <div className="status-card">
            <p>Empresa: {application?.companyName || 'No asignada'}</p>
            <p>
              Estado:{' '}
              <span className={`status-badge ${application?.status || 'unknown'}`}>
                {application?.status || 'Desconocido'}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="application-form">
          <h3>Postular a Pasantía</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={curriculum.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="estudios">Estudios:</label>
              <textarea
                id="estudios"
                name="estudios"
                value={curriculum.estudios}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="experiencia">Experiencia:</label>
              <textarea
                id="experiencia"
                name="experiencia"
                value={curriculum.experiencia}
                onChange={handleInputChange}
                placeholder="Describe tu experiencia laboral o académica"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="habilidades">Habilidades:</label>
              <textarea
                id="habilidades"
                name="habilidades"
                value={curriculum.habilidades}
                onChange={handleInputChange}
                placeholder="Ejemplo: trabajo en equipo, liderazgo, manejo de herramientas"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="sobreMi">Sobre Mí:</label>
              <textarea
                id="sobreMi"
                name="sobreMi"
                value={curriculum.sobreMi}
                onChange={handleInputChange}
                placeholder="Describe un poco sobre ti y tus intereses"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="selectedCompany">Seleccionar Empresa:</label>
              <select
                id="selectedCompany"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                required
              >
                <option value="">-- Seleccione una empresa --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="submit-button">
              Enviar Postulación
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;