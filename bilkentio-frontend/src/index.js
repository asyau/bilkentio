// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Main component of the app

// Creating a root element for rendering the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering the <App /> component inside the root div
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);