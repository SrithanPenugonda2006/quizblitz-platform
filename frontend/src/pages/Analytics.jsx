import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Gamepad2, Users, HelpCircle } from 'lucide-react';

export default function Analytics() {
    const { quizId } = useParams();
    const { addToast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/quizzes/${quizId}/analytics`)
            .then(r => { setData(r.data); setLoading(false); })
            .catch(() => { addToast('Failed to load analytics', 'error'); setLoading(false); });
    }, [quizId]);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!data) return null;

    const maxCorrectRate = Math.max(...(data.questionStats.map(q => q.correctRate)), 1);

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ padding: '40px 24px', maxWidth: 800 }}>
                {/* Header */}
                <div className="flex items-center gap-16 mb-32" style={{ marginBottom: 32 }}>
                    <Link to="/host-dashboard" className="btn btn-ghost btn-sm">← Back</Link>
                    <div>
                        <h1 style={{ fontSize: '1.75rem' }}>{data.quiz.title}</h1>
                        <p className="text-muted text-sm">Quiz Analytics</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid-3 mb-32" style={{ marginBottom: 32 }}>
                    {[
                        { icon: <Gamepad2 size={32} className="text-lime" />, label: 'Sessions', value: data.totalSessions },
                        { icon: <Users size={32} className="text-lime" />, label: 'Total Players', value: data.totalParticipants },
                        { icon: <HelpCircle size={32} className="text-lime" />, label: 'Questions', value: data.questionStats.length },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--lime)' }}>{s.value}</div>
                            <div className="text-muted text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Question Breakdown */}
                <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>Question Performance</h2>
                {data.questionStats.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No play data yet. Host a session first!</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data.questionStats.map((q, i) => (
                            <div key={i} className="card">
                                <div className="flex justify-between items-center mb-8" style={{ marginBottom: 8 }}>
                                    <div className="flex items-center gap-12">
                                        <span style={{
                                            background: 'var(--bg)', border: '1.5px solid var(--border)',
                                            width: 28, height: 28, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                        }}>{i + 1}</span>
                                        <p style={{ fontWeight: 500, lineHeight: 1.4 }}>{q.question}</p>
                                    </div>
                                    <span style={{
                                        color: q.correctRate >= 60 ? 'var(--success)' : q.correctRate >= 30 ? 'var(--warning)' : 'var(--danger)',
                                        fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', flexShrink: 0, marginLeft: 16
                                    }}>{q.correctRate}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{
                                        width: `${q.correctRate}%`,
                                        background: q.correctRate >= 60 ? 'var(--success)' : q.correctRate >= 30 ? 'var(--warning)' : 'var(--danger)',
                                        transition: 'width 1s ease'
                                    }} />
                                </div>
                                <div className="flex gap-16 mt-8" style={{ marginTop: 8 }}>
                                    <span className="text-muted text-sm">{q.correctAnswers}/{q.totalAnswers} correct</span>
                                    {q.correctRate < 40 && <span className="badge badge-danger">Hard question</span>}
                                    {q.correctRate >= 80 && <span className="badge badge-success">Easy question</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
