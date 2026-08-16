import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Tracker from './pages/Tracker.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import JobDetail from './pages/JobDetail.jsx';
import SourcesPage from './pages/SourcesPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <div className="header__inner">
          <div className="header__logo">🚀 AI Job Finder</div>
          <nav className="header__nav">
            <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`} end>
              Dashboard
            </NavLink>
            <NavLink to="/tracker" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
              Tracker
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
              Profile
            </NavLink>
            <NavLink to="/sources" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
              Sources
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/job/:id" element={<JobDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
