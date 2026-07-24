import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinancialPreferencesProvider } from './context/FinancialPreferencesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <FinancialPreferencesProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/expenses" 
                  element={
                    <ProtectedRoute>
                      <Expenses />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/income" 
                  element={
                    <ProtectedRoute>
                      <Income />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/budgets" 
                  element={
                    <ProtectedRoute>
                      <Budgets />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </FinancialPreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
