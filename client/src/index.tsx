import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './features/App';
import { enableES5 } from 'immer';
import debug from 'debug';

import 'design-system/globals.css'

enableES5();

debug.enable('musicplayer:*');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);