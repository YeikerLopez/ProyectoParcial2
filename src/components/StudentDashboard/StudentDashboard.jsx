import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './StudentDashboard.css';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch companies
        const companiesResponse = await fetch('http://localhost:3001/users?type=company');
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);

        // Check for existing application
        const applicationResponse = await fetch(
          `http://localhost:3001/applications?studentId=${user.id}&_sort=id&_order=desc&_limit=1`
        );
        const applicationData = await applicationResponse.json();
        if (applicationData.length > 0) {
          setApplication(applicationData[0]);
        }

        // Check for active internship
        const internshipResponse = await fetch(
          `http://localhost:3001/internships?studentId=${user.id}&status=active&_expand=application`
        );
        const internshipData = await internshipResponse.json();
        if (internshipData.length > 0) {
          setActiveInternship(internshipData[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurriculum((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany) {
      alert('Por favor, seleccione una empresa');
      return;
    }

    try {
      const applicationData = {
        studentId: user.id,
        companyId: parseInt(selectedCompany),
        curriculum: curriculum,
        status: 'pending',
        studentName: user.name,
        companyName: companies.find((c) => c.id === parseInt(selectedCompany))?.name,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3001/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        const newApplication = await response.json();
        setApplication(newApplication);
        alert('Postulación enviada con éxito');
        setCurriculum({
          nombre: '',
          estudios: '',
          experiencia: '',
          habilidades: '',
          sobreMi: '',
        });
        setSelectedCompany('');
      } else {
        throw new Error('Error al enviar la postulación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la postulación');
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    if (!activeInternship) return;

    try {
      const hours = parseInt(horasTrabajadas);
      const newLogEntry = {
        date: new Date().toISOString(),
        hours: hours,
        description: descripcionTrabajo,
      };

      const response = await fetch(
        `http://localhost:3001/internships/${activeInternship.id}`,
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

      if (response.ok) {
        const updatedInternship = await response.json();
        setActiveInternship(updatedInternship);
        setHorasTrabajadas('');
        setDescripcionTrabajo('');
        alert('Horas registradas con éxito');
      } else {
        throw new Error('Error al registrar las horas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar las horas');
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (activeInternship) {
    return (
      <div className="student-dashboard">
        <h2>Panel de Estudiante</h2>
        <div className="internship-status">
          <h3>Pasantía Activa</h3>
          <div className="status-card">
            <div className="company-info">
            <h4>
              Empresa: {companies.length > 0 ? companies[0]?.name : 'No asignada'}
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
                    width: `${(activeInternship?.loggedHours || 0) / 180 * 100}%`,
                  }}
                ></div>
                <span className="progress-text">
                  {activeInternship?.loggedHours || 0} / 180 horas
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
      </div>
    );
  }

  if (application) {
    return (
      <div className="student-dashboard">
        <h2>Panel de Estudiante</h2>
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
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <h2>Panel de Estudiante</h2>
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
    </div>
  );
};

export default StudentDashboard;
