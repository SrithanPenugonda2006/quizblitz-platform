import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    LayoutDashboard, Users, FileText, Gamepad2,
    Activity, CheckCircle, Target, Shield, Trash2
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState(null);
    const [quizToDelete, setQuizToDelete] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, [user]);

    async function loadData() {
        try {
            setLoading(true);
            const [statsRes, usersRes, quizzesRes, sessionsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/quizzes'),
                api.get('/admin/sessions'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setQuizzes(quizzesRes.data);
            setSessions(sessionsRes.data);
        } catch (err) {
            addToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function changeRole(userId, newRole) {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            addToast(`Role updated to ${newRole}`, 'success');
            loadData();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to update role', 'error');
        }
    }

    async function deleteUser(userId) {
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
            if (stats) setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
            addToast('User deleted successfully', 'success');
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to delete user', 'error');
        } finally {
            setUserToDelete(null);
        }
    }

    async function deleteQuiz(quizId) {
        try {
            await api.delete(`/admin/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
            if (stats) setStats(prev => ({ ...prev, totalQuizzes: prev.totalQuizzes - 1 }));
            addToast('Quiz deleted successfully', 'success');
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to delete quiz', 'error');
        } finally {
            setQuizToDelete(null);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <Navbar />
                <div className="loading-page"><div className="spinner" /><span className="text-muted">Loading admin panel…</span></div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: `Users (${users.length})`, icon: Users },
        { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: FileText },
        { id: 'sessions', label: `Sessions (${sessions.length})`, icon: Gamepad2 },
    ];

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div className="badge badge-danger" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, letterSpacing: '0.05em' }}>
                        <Shield size={16} /> ADMIN PANEL
                    </div>
                    <h1 className="text-white-bright" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', marginBottom: 8 }}>Platform Administration</h1>
                    <p className="text-gray-muted" style={{ fontSize: '1.05rem' }}>Manage users, quizzes, and monitor platform activity in real-time.</p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--border)',
                    paddingBottom: 0, overflowX: 'auto'
                }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            padding: '10px 18px', background: tab === t.id ? 'var(--lime)' : 'transparent', border: 'none', cursor: 'pointer',
                            color: tab === t.id ? '#111' : 'var(--text-muted)',
                            borderRadius: '8px',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.95rem',
                            transition: 'all 0.2s ease', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <t.icon size={18} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {tab === 'overview' && stats && (
                    <div>
                        <div className="grid-3" style={{ marginBottom: 32 }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: Users },
                                { label: 'Total Quizzes', value: stats.totalQuizzes, icon: FileText },
                                { label: 'Game Sessions', value: stats.totalSessions, icon: Gamepad2 },
                                { label: 'Active Now', value: stats.activeSessions, icon: Activity },
                                { label: 'Answers Submitted', value: stats.totalAnswers, icon: CheckCircle },
                                { label: 'Players Joined', value: stats.totalPlayers, icon: Target },
                            ].map(s => (
                                <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                                        <s.icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lime)', fontFamily: "'Space Grotesk'" }}>{s.value}</div>
                                    <div className="text-muted text-sm">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-white-bright" style={{ marginBottom: 16 }}>Role Breakdown</h3>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                            {stats.roleBreakdown.map(r => (
                                <div key={r.role} className={`badge badge-${r.role}`} style={{
                                    padding: '8px 16px', fontSize: '0.9rem', textTransform: 'capitalize'
                                }}>
                                    {r.role}: {r.count}
                                </div>
                            ))}
                        </div>

                        <h3 className="text-white-bright" style={{ marginBottom: 16 }}>Recent Users</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {stats.recentUsers.map(u => (
                                <div key={u.id} className="card admin-table-row" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong className="text-white-bright">{u.name}</strong>
                                        <span className="text-gray-muted text-sm" style={{ marginLeft: 10 }}>{u.email}</span>
                                    </div>
                                    <div className={`badge badge-${u.role}`} style={{ textTransform: 'capitalize' }}>
                                        {u.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {tab === 'users' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['ID', 'Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="text-white-bright" style={{
                                            textAlign: 'left', padding: '16px',
                                            fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                                            fontWeight: 700
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="text-gray-subtle" style={{ padding: '14px 16px', fontFamily: 'monospace' }}>#{u.id}</td>
                                        <td className="text-white-bright" style={{ padding: '14px 16px', fontWeight: 600 }}>{u.name}</td>
                                        <td className="text-gray-muted" style={{ padding: '14px 16px' }}>{u.email}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                                    className={`form-select badge-${u.role}`}
                                                    style={{
                                                        padding: '4px 30px 4px 12px',
                                                        fontSize: '0.85rem',
                                                        width: 'auto',
                                                        borderRadius: '999px',
                                                        cursor: 'pointer',
                                                        border: 'none',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                        outline: 'none',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    <option value="player" style={{ color: '#111' }}>Player</option>
                                                    <option value="host" style={{ color: '#111' }}>Host</option>
                                                    <option value="admin" style={{ color: '#111' }}>Admin</option>
                                                </select>
                                                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                                                    ▼
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-subtle" style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {userToDelete === u.id ? (
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Sure?</span>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Yes</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setUserToDelete(null)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>No</button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setUserToDelete(u.id)}
                                                    disabled={u.id === user?.id}
                                                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Quizzes Tab */}
                {tab === 'quizzes' && (
                    <div>
                        {quizzes.length === 0 ? (
                            <div className="text-center text-muted" style={{ padding: 60 }}>No quizzes created yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {quizzes.map(q => (
                                    <div key={q.id} className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{q.title}</div>
                                            <div className="text-muted text-sm">
                                                by <strong>{q.creator_name}</strong> · {q.question_count} questions · {q.session_count} sessions
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            {quizToDelete === q.id ? (
                                                <>
                                                    <span className="text-muted text-sm">Sure?</span>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteQuiz(q.id)} style={{ padding: '4px 8px' }}>Yes</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setQuizToDelete(null)} style={{ padding: '4px 8px' }}>No</button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setQuizToDelete(q.id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sessions Tab */}
                {tab === 'sessions' && (
                    <div>
                        {sessions.length === 0 ? (
                            <div className="text-center text-muted" style={{ padding: 60 }}>No game sessions yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {sessions.map(s => (
                                    <div key={s.id} className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                <strong style={{ fontSize: '1.1rem' }}>{s.quiz_title}</strong>
                                                <span className="badge" style={{
                                                    background: s.status === 'active' ? 'rgba(46,213,115,0.15)' : s.status === 'lobby' ? 'var(--lime-glow)' : 'var(--surface)',
                                                    color: s.status === 'active' ? 'var(--success)' : s.status === 'lobby' ? 'var(--lime)' : 'var(--text-muted)'
                                                }}>{s.status}</span>
                                            </div>
                                            <div className="text-muted text-sm">
                                                Room: <strong>{s.room_code}</strong> · Host: {s.host_name} · {s.player_count} players
                                            </div>
                                        </div>
                                        <div className="text-muted text-sm">
                                            {s.started_at ? new Date(s.started_at).toLocaleString() : 'Not started'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
