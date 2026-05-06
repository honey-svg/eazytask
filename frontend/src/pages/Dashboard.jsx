import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/tasks/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setStats(data.stats);
        
        setChartData([
          { name: 'To Do', value: data.stats.todo, color: '#94a3b8' },
          { name: 'In Progress', value: data.stats.in_progress, color: '#f59e0b' },
          { name: 'Done', value: data.stats.done, color: '#10b981' }
        ]);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container page-wrapper flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: '4px solid var(--border-strong)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <motion.div className="container page-wrapper" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-gradient">Dashboard Overview</h1>
          <p className="text-muted">Welcome back, {user?.name}. Here's your task breakdown.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted text-sm uppercase" style={{ letterSpacing: '0.05em' }}>Total Tasks</h3>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <LayoutDashboard size={24} style={{ color: 'var(--brand-primary)' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{stats?.total || 0}</p>
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted text-sm uppercase" style={{ letterSpacing: '0.05em' }}>In Progress</h3>
            <div style={{ background: 'var(--warning-bg)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Clock size={24} style={{ color: 'var(--warning)' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{stats?.in_progress || 0}</p>
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted text-sm uppercase" style={{ letterSpacing: '0.05em' }}>Completed</h3>
            <div style={{ background: 'var(--success-bg)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{stats?.done || 0}</p>
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }} variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-danger text-sm uppercase" style={{ letterSpacing: '0.05em' }}>Overdue Tasks</h3>
            <div style={{ background: 'var(--danger-bg)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
            </div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--danger)' }}>{stats?.overdue || 0}</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <motion.div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }} variants={itemVariants}>
          <h3 className="mb-6">Task Distribution</h3>
          {stats?.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-muted">No tasks available yet.</div>
          )}
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }} variants={itemVariants}>
          <h3 className="mb-6">Velocity (Status Breakdown)</h3>
          {stats?.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#334155" allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted">No tasks available yet.</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
