import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add error boundary for the root
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id "root" in your index.html');
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Application mounted successfully');
} catch (error) {
  console.error('Failed to mount application:', error);
  // Show error message to user
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #000;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      text-align: center;
    ">
      <h1 style="color: #ff4444; margin-bottom: 20px;">Application Error</h1>
      <p>Failed to load the application. Please try refreshing the page.</p>
      <p style="color: #888; margin-top: 10px;">If the problem persists, please contact support.</p>
    </div>
  `;
}