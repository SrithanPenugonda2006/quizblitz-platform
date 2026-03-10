import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Zap, Trophy, BarChart2 } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

export default function PlayerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');

    function handleJoin(e) {
        e.preventDefault();
        if (joinCode.trim()) navigate(`/join?code=${joinCode.trim().toUpperCase()}`);
    }

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="mb-32" style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: '2rem' }}>Player Dashboard</h1>
                    <p className="text-muted mt-8">Welcome back, <span className="text-lime">{user?.name}</span></p>
                </div>

                {/* Join Room Card */}
                <div className="card card-glow" style={{ marginBottom: 32 }}>
                    <h3 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={20} className="text-lime" /> Join a Quiz Room</h3>
                    <p className="text-muted text-sm mb-16" style={{ marginBottom: 16 }}>Enter a room code to join an active session</p>
                    <form onSubmit={handleJoin} className="flex gap-12" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                            id="join-room-code"
                            className="form-input"
                            placeholder="Enter room code (e.g. A3F7KP)"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            style={{ flex: 1, maxWidth: 300, letterSpacing: '0.1em', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '1.1rem' }}
                        />
                        <AnimatedButton type="submit">Join →</AnimatedButton>
                    </form>
                </div>

                <div className="grid-2" style={{ gap: '24px' }}>
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={18} /> Global Leaderboard</h3>
                        <p className="text-muted text-sm" style={{ marginTop: '8px' }}>Feature coming soon! Track your overall ranking against other players.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart2 size={18} /> Your Recent Quiz Results</h3>
                        <p className="text-muted text-sm" style={{ marginTop: '8px' }}>Feature coming soon! Review your performance history.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
