import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, FileText, Play, Edit, BarChart2, Trash2 } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function HostDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quizToDelete, setQuizToDelete] = useState(null);

    useEffect(() => {
        api.get('/quizzes').then(r => { setQuizzes(r.data); setLoading(false); })
            .catch(() => { setLoading(false); addToast('Failed to load quizzes', 'error'); });
    }, []);

    async function deleteQuiz(id) {
        try {
            await api.delete(`/quizzes/${id}`);
            setQuizzes(prev => prev.filter(q => q.id !== id));
            addToast('Quiz deleted', 'success');
        } catch {
            addToast('Failed to delete', 'error');
        } finally {
            setQuizToDelete(null);
        }
    }

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="flex items-center justify-between mb-32" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                    <div>
                        <h1 className="text-white-bright" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', marginBottom: 8 }}>Host Dashboard</h1>
                        <p className="text-gray-muted" style={{ fontSize: '1.05rem' }}>Welcome back, <span className="text-lime">{user?.name}</span></p>
                    </div>
                    <div>
                        <AnimatedButton to="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={16} /> New Quiz
                        </AnimatedButton>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-16" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 className="text-white-bright" style={{ fontSize: '1.5rem' }}>Your Quizzes & Events</h2>
                    <span className="badge badge-muted text-gray-muted">{quizzes.length} total</span>
                </div>

                {loading ? (
                    <div className="loading-page" style={{ minHeight: 200 }}><div className="spinner" /></div>
                ) : quizzes.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                            <FileText size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-white-bright" style={{ marginBottom: 8 }}>No quizzes yet</h3>
                        <p className="text-gray-muted mb-24" style={{ marginBottom: 24 }}>Create your first quiz to get started</p>
                        <AnimatedButton to="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={16} /> Create Quiz
                        </AnimatedButton>
                    </div>
                ) : (
                    <div className="grid-2">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="card admin-table-row" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 className="text-white-bright" style={{ fontSize: '1.2rem' }}>{quiz.title}</h3>
                                    <span className="badge badge-muted text-gray-subtle">{quiz.question_count} Q</span>
                                </div>
                                {quiz.description && <p className="text-gray-muted text-sm">{quiz.description}</p>}
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <span className="text-gray-subtle">⏱ {quiz.time_per_question}s per question</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                    <AnimatedButton to={`/host/${quiz.id}`} className="btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Play size={14} /> Host Match</AnimatedButton>
                                    <Link to={`/create?edit=${quiz.id}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Edit size={14} /> Edit</Link>
                                    <Link to={`/analytics/${quiz.id}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart2 size={14} /> Stats</Link>
                                    {quizToDelete === quiz.id ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <span className="text-gray-muted" style={{ fontSize: '0.8rem' }}>Sure?</span>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteQuiz(quiz.id)} style={{ padding: '8px 12px' }}>Yes</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setQuizToDelete(null)} style={{ padding: '8px 12px' }}>No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setQuizToDelete(quiz.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
