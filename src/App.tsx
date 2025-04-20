import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BFFBotPage from './pages/BFFBotPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/bff-agent" element={<BFFBotPage />} />
        <Route path="/" element={<Navigate to="/home-page" replace />} />
      </Routes>
    </Router>
  );
}

export default App;