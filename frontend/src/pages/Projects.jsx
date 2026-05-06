import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        fetchProjects();
        toast.success('Project created successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div className="container page-wrapper" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-gradient">Projects</h1>
          <p className="text-muted mt-2">Manage your team's workspaces and agile boards</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex items-center justify-center flex-col text-center" style={{ height: '40vh' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <FolderKanban size={48} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h3 className="mb-2">No projects found</h3>
          <p className="text-muted mb-6 max-w-md">Get started by creating a new project to organize your tasks and collaborate with your team.</p>
          {user?.role === 'ADMIN' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {projects.map((project) => (
            <motion.div key={project._id} variants={itemVariants} style={{ height: '100%' }}>
              <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                <div className="glass-panel" style={{ height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{ background: 'var(--brand-glow)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                        <FolderKanban size={24} style={{ color: 'var(--brand-primary)' }} />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>{project.name}</h3>
                    </div>
                    
                    <p className="text-muted mb-6" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.ownerId?.name || 'Admin')}&background=random&color=fff&rounded=true&size=24`} 
                        alt="Owner" 
                      />
                      <span>{project.ownerId?.name || 'Unknown Owner'}</span>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--brand-primary)' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div 
              className="glass-panel" 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
            >
              <h2 className="mb-6">Create New Project</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Brief description of the project..."></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
