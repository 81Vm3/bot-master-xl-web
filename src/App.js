import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import BotManagement from './pages/BotManagement';
import ServerManagement from './pages/ServerManagement';
import LLMManager from './pages/LLMManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainLayout />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bots" element={<BotManagement />} />
          <Route path="servers" element={<ServerManagement />} />
          <Route path="llm" element={<LLMManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
