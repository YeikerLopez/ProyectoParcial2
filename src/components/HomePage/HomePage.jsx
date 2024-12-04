import React, { useState } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('estudiantes');

  const renderContent = () => {
    switch(activeTab) {
      case 'estudiantes':
        return (
          <div>
            <h3>Para Estudiantes</h3>
            <p>Encuentra oportunidades de pasantías que se ajusten a tu carrera y objetivos profesionales.</p>
            <ul>
              <li>Explora pasantías en diversas empresas</li>
              <li>Aplica directamente desde la plataforma</li>
              <li>Haz seguimiento a tus aplicaciones</li>
              <li>Recibe notificaciones sobre nuevas oportunidades</li>
            </ul>
          </div>
        );
      case 'empresas':
        return (
          <div>
            <h3>Para Empresas</h3>
            <p>Conecta con talento joven y motivado de la ULEAM para tus proyectos y oportunidades laborales.</p>
            <ul>
              <li>Publica ofertas de pasantías</li>
              <li>Revisa perfiles de estudiantes</li>
              <li>Gestiona aplicaciones y entrevistas</li>
              <li>Colabora con la universidad en programas de desarrollo profesional</li>
            </ul>
          </div>
        );
      case 'facultades':
        return (
          <div>
            <h3>Para Facultades</h3>
            <p>Facilita la conexión entre tus estudiantes y las oportunidades del mundo laboral.</p>
            <ul>
              <li>Supervisa el progreso de los estudiantes en pasantías</li>
              <li>Colabora con empresas para crear programas de pasantías</li>
              <li>Accede a informes y estadísticas sobre la participación de los estudiantes</li>
              <li>Ayuda a tus estudiantes a cumplir con los requisitos de graduación</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-page">
      <h1>Bienvenido al Sistema de Pasantías</h1>
      <p>Universidad Laica Eloy Alfaro de Manabí</p>
      
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'estudiantes' ? 'active' : ''}`}
          onClick={() => setActiveTab('estudiantes')}
        >
          Para Estudiantes
        </button>
        <button 
          className={`tab-button ${activeTab === 'empresas' ? 'active' : ''}`}
          onClick={() => setActiveTab('empresas')}
        >
          Para Empresas
        </button>
        <button 
          className={`tab-button ${activeTab === 'facultades' ? 'active' : ''}`}
          onClick={() => setActiveTab('facultades')}
        >
          Para Facultades
        </button>
      </div>
      
      <div className="tab-content">
        {renderContent()}
      </div>
      
      <div className="cta-container">
        <h3>¿Listo para comenzar?</h3>
        <button className="cta-button">Explorar Pasantías</button>
      </div>
    </div>
  );
};

export default HomePage;

