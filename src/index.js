import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DAOContext from './context/DAOContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <DAOContext>
    <App />
  </DAOContext>
  </React.StrictMode>
);