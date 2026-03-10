import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectSocket } from '../services/socket';
import Timer from '../components/Timer';
import LeaderboardRow from '../components/LeaderboardRow';
import AnimatedButton from '../components/AnimatedButton';
import { Trophy, BarChart2, AlertTriangle } from 'lucide-react';

const PHASE = { WAITING: 'waiting', COUNTDOWN: 'countdown', QUESTION: 'question', RESULT: 'result', LEADERBOARD: 'leaderboard', END: 'end' };

export default function LiveQuiz() {
    const { roomCode } = useParams();
    const [params] = useSearchParams();
    const isHost = params.get('host') === '1';
    const { token } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [phase, setPhase] = useState(PHASE.WAITING);
    const [countdown, setCountdown] = useState(3);
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(20);
    const [result, setResult] = useState(null); // { correctAnswer, playerResults }
    const [leaderboard, setLeaderboard] = useState([]);
    const [answerCount, setAnswerCount] = useState({ answered: 0, total: 0 });
    const [tabWarnings, setTabWarnings] = useState(0);
    const timerRef = useRef(null);
    const socketRef = useRef(null);

    // Anti-cheat: tab switch detection
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.hidden && phase === PHASE.QUESTION) {
                setTabWarnings(w => {
                    const newW = w + 1;
                    addToast(`Tab switch detected! Warning ${newW}/3`, 'error');
                    return newW;
                });
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [phase]);

    useEffect(() => {
        const s = connectSocket(token);
        socketRef.current = s;

        s.on('quiz-starting', ({ countdown: c }) => {
            setPhase(PHASE.COUNTDOWN);
            setCountdown(c);
            let t = c;
            const interval = setInterval(() => {
                t--;
                setCountdown(t);
                if (t <= 0) clearInterval(interval);
            }, 1000);
        });

        s.on('question', (data) => {
            clearInterval(timerRef.current);
            setQuestion(data);
            setSelectedAnswer(null);
            setResult(null);
            setTotalTime(data.timeLimit);
            setTimeLeft(data.timeLimit);
            setPhase(PHASE.QUESTION);
            setAnswerCount({ answered: 0, total: 0 });

            let t = data.timeLimit;
            timerRef.current = setInterval(() => {
                t--;
                setTimeLeft(t);
                if (t <= 0) clearInterval(timerRef.current);
            }, 1000);
        });

        s.on('answer-count', (data) => setAnswerCount(data));

        s.on('question-result', (data) => {
            clearInterval(timerRef.current);
            setResult(data);
            setPhase(PHASE.RESULT);
        });

        s.on('leaderboard', ({ leaderboard: lb }) => {
            setLeaderboard(lb);
            setPhase(PHASE.LEADERBOARD);
        });

        s.on('quiz-end', ({ leaderboard: lb }) => {
            setLeaderboard(lb);
            setPhase(PHASE.END);
        });

        s.on('host-left', () => {
            addToast('Host disconnected. Quiz ended.', 'error');
            setTimeout(() => navigate('/'), 2000);
        });

        return () => {
            clearInterval(timerRef.current);
            s.off('quiz-starting'); s.off('question'); s.off('answer-count');
            s.off('question-result'); s.off('leaderboard'); s.off('quiz-end'); s.off('host-left');
        };
    }, [token]);

    function submitAnswer(answer) {
        if (selectedAnswer || phase !== PHASE.QUESTION) return;
        setSelectedAnswer(answer);
        socketRef.current?.emit('submit-answer', { roomCode, answer, questionId: question?.questionId });
        addToast('Answer submitted! ⚡', 'info');
    }

    function nextQuestion() {
        socketRef.current?.emit('next-question', { roomCode });
    }

    // ===================== COUNTDOWN =====================
    if (phase === PHASE.COUNTDOWN) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <p className="text-muted text-lg">Get ready!</p>
                <div style={{ fontSize: '8rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--lime)', lineHeight: 1, animation: 'pulse 0.8s ease-in-out infinite' }}>
                    {countdown}
                </div>
                <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
            </div>
        );
    }

    // ===================== WAITING =====================
    if (phase === PHASE.WAITING) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: '4rem' }}>⏳</div>
                <h2 style={{ fontSize: '2rem' }}>Waiting for host to start…</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)' }}>
                    <div className="dot-flashing" />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Room: <strong className="text-lime" style={{ letterSpacing: '0.1em' }}>{roomCode}</strong></p>
            </div>
        );
    }

    // ===================== QUESTION =====================
    if (phase === PHASE.QUESTION && question) {
        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionValues = [question.options.A, question.options.B, question.options.C, question.options.D];

        return (
            <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Progress bar */}
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(question.questionNumber / question.totalQuestions) * 100}%` }} />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <span className="badge badge-muted">Question {question.questionNumber}/{question.totalQuestions}</span>
                    <Timer total={totalTime} current={timeLeft} />
                    <span className="badge badge-muted">{answerCount.answered}/{answerCount.total} answered</span>
                </div>

                {/* Question */}
                <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 32px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', lineHeight: 1.4 }}>{question.question}</h2>
                </div>

                {/* Options */}
                <div className="answer-grid" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
                    {optionLabels.map((letter, i) => (
                        <button
                            key={letter}
                            id={`option-${letter}`}
                            className={`answer-option ${selectedAnswer === letter ? 'selected' : ''}`}
                            onClick={() => submitAnswer(letter)}
                            disabled={!!selectedAnswer}
                        >
                            <span className="answer-letter">{letter}</span>
                            {optionValues[i]}
                        </button>
                    ))}
                </div>

                {isHost && (
                    <div style={{ textAlign: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={nextQuestion}>Skip question →</button>
                    </div>
                )}

                {tabWarnings >= 3 && (
                    <div style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid var(--danger)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} className="text-danger" /> Multiple tab switches detected. Your score may be flagged.</div>
                    </div>
                )}
            </div>
        );
    }

    // ===================== RESULT =====================
    if (phase === PHASE.RESULT && result) {
        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionValues = question ? [question.options.A, question.options.B, question.options.C, question.options.D] : [];
        const myResult = result.playerResults?.find(p => p.socketId === socketRef.current?.id);

        return (
            <div style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>{myResult?.isCorrect ? '✅' : '❌'}</div>
                    <h2 style={{ fontSize: '2rem', marginTop: 8 }}>{myResult?.isCorrect ? 'Correct!' : 'Wrong!'}</h2>
                    {myResult && <p className="text-muted mt-8">+{myResult.points} points this round</p>}
                </div>

                {question && (
                    <div style={{ width: '100%', maxWidth: 700 }}>
                        <div className="answer-grid">
                            {optionLabels.map((letter, i) => (
                                <div
                                    key={letter}
                                    className={`answer-option ${letter === result.correctAnswer ? 'correct' : (selectedAnswer === letter && selectedAnswer !== result.correctAnswer) ? 'wrong' : ''}`}
                                    style={{ cursor: 'default' }}
                                >
                                    <span className="answer-letter">{letter}</span>
                                    {optionValues[i]}
                                    {letter === result.correctAnswer && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-muted pulse">Leaderboard coming up…</p>
            </div>
        );
    }

    // ===================== LEADERBOARD =====================
    if (phase === PHASE.LEADERBOARD || phase === PHASE.END) {
        return (
            <div style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>{phase === PHASE.END ? <Trophy size={48} className="text-lime" /> : <BarChart2 size={48} className="text-lime" />}</div>
                    <h1 style={{ fontSize: '2rem', marginTop: 8 }}>{phase === PHASE.END ? 'Final Results' : 'Leaderboard'}</h1>
                </div>

                <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {leaderboard.map(row => (
                        <LeaderboardRow key={row.userId} rank={row.rank} nickname={row.nickname} score={row.score} lastPoints={row.lastPoints} />
                    ))}
                </div>

                {phase === PHASE.END && (
                    <div className="flex gap-12" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        <AnimatedButton onClick={() => navigate('/player-dashboard')}>Back to Dashboard</AnimatedButton>
                        <button className="btn btn-ghost" onClick={() => window.location.reload()}>Play Again</button>
                    </div>
                )}

                {isHost && phase === PHASE.LEADERBOARD && (
                    <AnimatedButton onClick={nextQuestion}>Next Question →</AnimatedButton>
                )}
            </div>
        );
    }

    return null;
}
