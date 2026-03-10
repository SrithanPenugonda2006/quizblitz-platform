import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectSocket } from '../services/socket';
import Navbar from '../components/Navbar';
import { Zap } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function JoinRoom() {
    const { token, user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [roomCode, setRoomCode] = useState(params.get('code') || '');
    const [nickname, setNickname] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    function handleJoin(e) {
        e.preventDefault();
        if (!roomCode.trim() || !nickname.trim()) { addToast('Room code and nickname required', 'error'); return; }
        setLoading(true);
        const s = connectSocket(token);

        s.emit('join-room', { roomCode: roomCode.trim().toUpperCase(), nickname: nickname.trim() }, (res) => {
            if (res.error) { addToast(res.error, 'error'); setLoading(false); return; }
            addToast(`Joined "${res.quizTitle}"!`, 'success');
            navigate(`/live/${roomCode.trim().toUpperCase()}`);
        });
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.5rem' }}><Zap size={24} fill="currentColor" /><span style={{ color: 'var(--text)' }}>Quiz</span>Blitz</Link>
                    <h1 style={{ fontSize: '2rem', marginTop: 16 }}>Join a Quiz</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Enter the room code from your host</p>
                </div>

                <div className="card">
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Room Code</label>
                            <input
                                id="room-code-input"
                                className="form-input"
                                placeholder="e.g. A3F7KP"
                                value={roomCode}
                                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                                style={{ fontSize: '1.5rem', letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif" }}
                                maxLength={8}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Nickname</label>
                            <input
                                id="nickname-input"
                                className="form-input"
                                placeholder="e.g. SpeedQuizzer42"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                required
                            />
                        </div>
                        <AnimatedButton type="submit" fullWidth disabled={loading}>
                            {loading ? 'Joining…' : 'Join Room'}
                            {!loading && <span className="btn-arrow">→</span>}
                        </AnimatedButton>
                    </form>

                    {!user && (
                        <>
                            <div className="divider" />
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Link to="/login" style={{ color: 'var(--lime)' }}>Sign in</Link> to save your scores
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
