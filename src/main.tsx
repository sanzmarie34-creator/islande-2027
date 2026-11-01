import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { StoreProvider } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import DayPage from './pages/DayPage';
import Securite from './pages/Securite';
import Programme from './pages/Programme';
import { Budget, Checklist, Hebergements, Notes, Sources } from './pages/Tools';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jour/:n" element={<DayPage />} />
            <Route path="securite" element={<Securite />} />
            <Route path="hebergements" element={<Hebergements />} />
            <Route path="budget" element={<Budget />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="notes" element={<Notes />} />
            <Route path="sources" element={<Sources />} />
            <Route path="programme" element={<Programme />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
);
