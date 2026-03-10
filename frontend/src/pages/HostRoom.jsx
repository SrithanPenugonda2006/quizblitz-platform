import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectSocket, disconnectSocket } from '../services/socket';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AnimatedButton from '../components/AnimatedButton';

export default function HostRoom() {
    const { quizId } = useParams();
    const { token, user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [status, setStatus] = useState('connecting'); // connecting, lobby, started
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        api.get(`/quizzes/${quizId}`).then(r => setQuiz(r.data));
        const s = connectSocket(token);
        setSocket(s);

        s.emit('create-room', { quizId: Number(quizId) }, (res) => {
            if (res.error) { addToast(res.error, 'error'); navigate('/host-dashboard'); return; }
            setRoomCode(res.roomCode);
            setStatus('lobby');
        });

        s.on('player-joined', ({ players }) => setPlayers(players));
        s.on('player-left', ({ players }) => setPlayers(players));

        return () => { s.off('player-joined'); s.off('player-left'); };
    }, [quizId]);

    function startQuiz() {
        if (players.length === 0) { addToast('Need at least 1 player to start', 'error'); return; }
        socket.emit('start-quiz', { roomCode }, () => {
            navigate(`/live/${roomCode}?host=1`);
        });
    }

    function copyCode() {
        navigator.clipboard.writeText(roomCode);
        addToast('Room code copied!', 'success');
    }

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ padding: '40px 24px', maxWidth: 700, textAlign: 'center' }}>
                {status === 'connecting' ? (
                    <div className="loading-page" style={{ minHeight: 400 }}><div className="spinner" /><p className="text-muted">Creating room…</p></div>
                ) : (
                    <>
                        <div className="badge badge-lime mb-24" style={{ marginBottom: 24, display: 'inline-flex' }}>🎤 Hosting as {user?.name}</div>
                        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{quiz?.title}</h1>
                        <p className="text-muted mb-32" style={{ marginBottom: 32 }}>Share the room code with your players</p>

                        {/* Room Code */}
                        <div className="card card-glow" style={{ marginBottom: 32, cursor: 'pointer' }} onClick={copyCode}>
                            <p className="text-muted text-sm mb-8" style={{ marginBottom: 8 }}>ROOM CODE</p>
                            <div style={{
                                fontSize: 'clamp(3rem, 10vw, 5rem)',
                                fontWeight: 700,
                                fontFamily: "'Space Grotesk', sans-serif",
                                color: 'var(--lime)',
                                letterSpacing: '0.15em',
                                lineHeight: 1
                            }}>{roomCode}</div>
                            <p className="text-muted text-sm mt-16" style={{ marginTop: 16 }}>Click to copy • Players join at <strong>localhost:5173/join</strong></p>
                        </div>

                        {/* Players */}
                        <div className="card mb-32" style={{ marginBottom: 32, textAlign: 'left' }}>
                            <div className="flex justify-between items-center mb-16" style={{ marginBottom: 16 }}>
                                <h3>Participants</h3>
                                <span className="badge badge-lime">{players.length} joined</span>
                            </div>
                            {players.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                    <div className="dot-flashing" style={{ margin: '0 auto 12px' }} />
                                    Waiting for players to join…
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {players.map(p => (
                                        <span key={p.userId || p.nickname} className="badge badge-muted" style={{ padding: '6px 12px' }}>
                                            {p.nickname}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AnimatedButton fullWidth className="btn-lg" onClick={startQuiz}>
                            Start Quiz →
                        </AnimatedButton>
                    </>
                )}
            </div>
        </div>
    );
}
