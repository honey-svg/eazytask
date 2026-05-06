import { useContext } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Login, Signup } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  
  if (!user) return null;
  
  return (
    <nav className="navbar">
      <div className="font-bold text-gradient flex items-center gap-2" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
        <FolderKanban size={28} style={{ color: 'var(--brand-primary)' }} />
        EazyTask<span style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>PRO</span>
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link flex items-center gap-2 ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/projects" className={`nav-link flex items-center gap-2 ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
          <FolderKanban size={18} /> Projects
        </Link>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-strong)', margin: '0 0.5rem' }}></div>
        <div className="flex items-center gap-3">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&rounded=true`} 
            alt="Avatar" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border-subtle)' }}
          />
          <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const location = useLocation();
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' },
          success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } }
        }} 
      />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
