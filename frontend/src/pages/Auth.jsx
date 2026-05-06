import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MEMBER', 'ADMIN']),
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      
      login(resData.user, resData.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="container flex items-center justify-center" style={{ minHeight: '100vh' }} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center mb-8">
          <div style={{ background: 'var(--brand-glow)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <ShieldCheck size={32} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 className="text-center text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>Sign In to EazyTask</h2>
          <p className="text-muted mt-2">Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" {...register('email')} placeholder="you@example.com" />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" {...register('password')} placeholder="••••••••" />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-muted">
          Don't have an account? <Link to="/signup" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </motion.div>
  );
};

export const Signup = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'MEMBER' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      
      login(resData.user, resData.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="container flex items-center justify-center" style={{ minHeight: '100vh' }} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center mb-8">
          <div style={{ background: 'var(--brand-glow)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <UserPlus size={32} style={{ color: 'var(--brand-secondary)' }} />
          </div>
          <h2 className="text-center text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>Join EazyTask</h2>
          <p className="text-muted mt-2">Create an account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" {...register('name')} placeholder="John Doe" />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" {...register('email')} placeholder="you@example.com" />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" {...register('password')} placeholder="••••••••" />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select className="form-input" {...register('role')}>
              <option value="MEMBER">Team Member</option>
              <option value="ADMIN">Administrator</option>
            </select>
            {errors.role && <span className="form-error">{errors.role.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-muted">
          Already have an account? <Link to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};
