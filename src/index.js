import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import './fonts/fonts.css';

import App from './App';
import Nav from './components/Nav';

import { HashRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <HashRouter>
            <Nav />
            <App />
        </HashRouter>
    </React.StrictMode>
);
