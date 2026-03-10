import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Zap, AlertTriangle } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function Login() {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.user, data.token);
            addToast(`Welcome back, ${data.user.name}!`, 'success');
            if (data.user.role === 'admin') navigate('/admin-dashboard');
            else if (data.user.role === 'host') navigate('/host-dashboard');
            else navigate('/player-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.5rem' }}><Zap size={24} fill="currentColor" /><span style={{ color: 'var(--text)' }}>Quiz</span>Blitz</Link>
                    <h1 style={{ fontSize: '2rem', marginTop: 16 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Sign in to your account</p>
                </div>

                <div className="card">
                    {error && (
                        <div style={{
                            padding: '12px 16px', background: 'rgba(255, 71, 87, 0.1)',
                            border: '1px solid rgba(255, 71, 87, 0.2)', borderRadius: 8,
                            color: 'var(--danger)', marginBottom: 20, fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <AlertTriangle size={18} className="text-danger" /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                id="login-email"
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                id="login-password"
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group flex justify-between items-center">
                            <label className="flex items-center gap-8 text-sm text-gray-muted cursor-pointer hover:text-white transition">
                                <input type="checkbox" style={{ accentColor: 'var(--lime)' }} /> Remember me
                            </label>
                            <a href="#" className="text-sm text-lime hover:underline">Forgot password?</a>
                        </div>
                        <AnimatedButton type="submit" fullWidth disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                            {!loading && <span className="btn-arrow">→</span>}
                        </AnimatedButton>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No account?{' '}
                        <Link to="/register" style={{ color: 'var(--lime)', fontWeight: 600 }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
