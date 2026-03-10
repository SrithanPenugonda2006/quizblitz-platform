import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AnimatedButton from '../components/AnimatedButton';
import { Save, Rocket } from 'lucide-react';

const BLANK_Q = { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' };

export default function QuizCreator() {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const editId = params.get('edit');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timePerQ, setTimePerQ] = useState(20);
    const [questions, setQuestions] = useState([{ ...BLANK_Q }]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editId) {
            setLoading(true);
            api.get(`/quizzes/${editId}`).then(r => {
                setTitle(r.data.title);
                setDescription(r.data.description || '');
                setTimePerQ(r.data.time_per_question);
                setQuestions(r.data.questions.length > 0 ? r.data.questions : [{ ...BLANK_Q }]);
                setLoading(false);
            }).catch(() => { addToast('Failed to load quiz', 'error'); setLoading(false); });
        }
    }, [editId]);

    function addQuestion() {
        setQuestions(prev => [...prev, { ...BLANK_Q }]);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }

    function updateQ(idx, field, value) {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    }

    function removeQ(idx) {
        if (questions.length === 1) { addToast('Must have at least 1 question', 'error'); return; }
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!title.trim()) { addToast('Quiz title is required', 'error'); return; }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
                addToast(`Question ${i + 1} is incomplete`, 'error'); return;
            }
        }
        setSaving(true);
        try {
            const payload = { title, description, time_per_question: timePerQ, questions };
            if (editId) {
                await api.put(`/quizzes/${editId}`, payload);
                addToast('Quiz updated!', 'success');
            } else {
                await api.post('/quizzes', payload);
                addToast('Quiz created!', 'success');
            }
            navigate('/host-dashboard');
        } catch (err) {
            addToast(err.response?.data?.error || 'Save failed', 'error');
        } finally { setSaving(false); }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ padding: '40px 24px', maxWidth: 800 }}>
                <div className="flex items-center gap-16 mb-32" style={{ marginBottom: 32 }}>
                    <Link to="/host-dashboard" className="btn btn-ghost btn-sm">← Back</Link>
                    <h1 style={{ fontSize: '1.75rem' }}>{editId ? 'Edit Quiz' : 'Create Quiz'}</h1>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* Quiz Settings */}
                    <div className="card">
                        <h3 style={{ marginBottom: 20 }}>Quiz Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input id="quiz-title" className="form-input" placeholder="e.g. World Geography Quiz"
                                    value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" placeholder="Optional description…"
                                    value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time per question (seconds)</label>
                                <select className="form-select" value={timePerQ} onChange={e => setTimePerQ(Number(e.target.value))}>
                                    {[5, 10, 15, 20, 30, 45, 60].map(t => <option key={t} value={t}>{t}s</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    {questions.map((q, idx) => (
                        <div key={idx} className="card" style={{ borderLeft: '3px solid var(--lime)' }}>
                            <div className="flex justify-between items-center mb-16" style={{ marginBottom: 16 }}>
                                <div className="flex items-center gap-12">
                                    <span style={{
                                        background: 'var(--lime)', color: '#111', width: 28, height: 28,
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                                    }}>{idx + 1}</span>
                                    <h3 style={{ fontSize: '1rem' }}>Question {idx + 1}</h3>
                                </div>
                                <button type="button" onClick={() => removeQ(idx)} className="btn btn-danger btn-sm">✕ Remove</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Question Text *</label>
                                    <textarea className="form-textarea" placeholder="What is the question?"
                                        value={q.question} onChange={e => updateQ(idx, 'question', e.target.value)} rows={2} required />
                                </div>

                                <div className="grid-2">
                                    {['A', 'B', 'C', 'D'].map(letter => (
                                        <div key={letter} className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    background: q.correct_answer === letter ? 'var(--lime)' : 'var(--bg)',
                                                    color: q.correct_answer === letter ? '#111' : 'var(--text-muted)',
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, cursor: 'pointer',
                                                    border: '1.5px solid var(--border)',
                                                    transition: 'all 0.2s'
                                                }} onClick={() => updateQ(idx, 'correct_answer', letter)}>{letter}</span>
                                                Option {letter}
                                                {q.correct_answer === letter && <span className="badge badge-lime" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>✓ Answer</span>}
                                            </label>
                                            <input className="form-input" placeholder={`Option ${letter}`}
                                                value={q[`option_${letter.toLowerCase()}`]}
                                                onChange={e => updateQ(idx, `option_${letter.toLowerCase()}`, e.target.value)} required />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
                        <button type="button" onClick={addQuestion} className="btn btn-ghost">+ Add Question</button>
                        <AnimatedButton type="submit" disabled={saving}>
                            {saving ? 'Saving…' : editId ? <><Save size={18} /> Update Quiz</> : <><Rocket size={18} /> Save Quiz</>}
                        </AnimatedButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
