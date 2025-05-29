import React from 'react';
import { BrowserRouter as Router, Route, Routes,} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import HomePage from './components/HomePage/HomePage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import TutorDashboard from './components/TutorDashboard/TutorDashboard';
import CompanyDashboard from './components/CompanyDashboard/CompanyDashboard';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <TutorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

