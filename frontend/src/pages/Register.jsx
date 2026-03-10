import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Eye, EyeOff, Check, X, Zap, AlertTriangle } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function Register() {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'player' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Dynamic password requirements evaluation
    const reqs = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        lower: /[a-z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        special: /[^A-Za-z0-9]/.test(form.password)
    };
    const isPasswordValid = Object.values(reqs).every(Boolean);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Password does not meet security requirements.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data.user, data.token);
            addToast(`Welcome, ${data.user.name}!`, 'success');
            if (data.user.role === 'admin') navigate('/admin-dashboard');
            else if (data.user.role === 'host') navigate('/host-dashboard');
            else navigate('/player-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.5rem' }}><Zap size={24} fill="currentColor" /><span style={{ color: 'var(--text)' }}>Quiz</span>Blitz</Link>
                    <h1 style={{ fontSize: '2rem', marginTop: 16 }}>Create account</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Start hosting or playing for free</p>
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
                            <label className="form-label">Full Name</label>
                            <input id="reg-name" className="form-input" type="text" placeholder="Jane Smith"
                                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input id="reg-email" className="form-input" type="email" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input id="reg-password" className="form-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="min. 8 characters"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    required
                                    style={{ paddingRight: 40 }}
                                />
                                <button type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {form.password.length > 0 && (
                                <div style={{ fontSize: '0.85rem', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Password must contain:</div>
                                    <div style={{ color: reqs.length ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {reqs.length ? <Check size={14} /> : <X size={14} />} At least 8 characters
                                    </div>
                                    <div style={{ color: reqs.upper ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {reqs.upper ? <Check size={14} /> : <X size={14} />} One uppercase letter
                                    </div>
                                    <div style={{ color: reqs.lower ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {reqs.lower ? <Check size={14} /> : <X size={14} />} One lowercase letter
                                    </div>
                                    <div style={{ color: reqs.number ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {reqs.number ? <Check size={14} /> : <X size={14} />} One number
                                    </div>
                                    <div style={{ color: reqs.special ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {reqs.special ? <Check size={14} /> : <X size={14} />} One special character
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">I want to</label>
                            <select id="reg-role" className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                <option value="player">Play & join quizzes</option>
                                <option value="host">Host & create quizzes</option>
                            </select>
                        </div>
                        <AnimatedButton type="submit" fullWidth disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account'}
                            {!loading && <span className="btn-arrow">→</span>}
                        </AnimatedButton>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Have an account? <Link to="/login" style={{ color: 'var(--lime)', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
