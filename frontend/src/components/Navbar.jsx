import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Shield } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap className="text-lime" size={24} fill="currentColor" />
                    <span>Quiz</span>Blitz
                </Link>
                <div className="navbar-links">
                    {user ? (
                        <>
                            <span className="text-muted text-sm">Hey, <strong className="text-lime">{user.name}</strong></span>
                            {user.role === 'admin' ? (
                                <Link to="/admin-dashboard" className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Shield size={14} /> Admin
                                </Link>
                            ) : (
                                <Link to={user.role === 'host' ? "/host-dashboard" : "/player-dashboard"} className="btn btn-ghost btn-sm">Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-surface btn-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-lime btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
