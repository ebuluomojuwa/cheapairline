import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle benign Vite HMR websocket disconnects in the containerized preview environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (typeof event.reason === 'string' || typeof event.reason.message === 'string')
    ) {
      const msg = typeof event.reason === 'string' ? event.reason : event.reason.message;
      if (
        msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('closed without opened')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('WebSocket') ||
        event.message.includes('websocket') ||
        event.message.includes('closed without opened'))
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
