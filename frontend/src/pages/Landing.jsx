import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Zap, Trophy, Shield, BarChart3, Users, PlayCircle,
    GraduationCap, Building2, Calendar, Twitter, Github, MapPin
} from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

const features = [
    { icon: <Zap size={24} />, title: 'Real-Time Sync', desc: 'WebSocket-powered questions delivered simultaneously to all players with instant feedback loop.' },
    { icon: <Trophy size={24} />, title: 'Live Leaderboard', desc: 'Scores update instantly after every question — watch rankings shift in real time as players answer.' },
    { icon: <Shield size={24} />, title: 'Anti-Cheat Engine', desc: 'Tab-switch detection, single session enforcement, and randomized question order to ensure fair play.' },
    { icon: <BarChart3 size={24} />, title: 'Deep Analytics', desc: 'Comprehensive insights into performance, question difficulty, and participant statistics.' },
];

const testimonials = [
    { name: "Sarah Jenkins", role: "High School Teacher", text: "This completely changed how I do Friday reviews. The students absolutely love the competitive leaderboard." },
    { name: "David Chen", role: "Event Coordinator", text: "We used QuizBlitz for our company retreat of 500+ people. It handled the traffic flawlessly and everyone was engaged." },
    { name: "Maria Garcia", role: "Community Manager", text: "The cleanest UI I've seen in a quiz app. Setting up a room takes seconds and the players don't even need an account." }
];

export default function Landing() {
    return (
        <div className="page">
            <Navbar />

            {/* Hero Section */}
            <section style={{
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '80px 24px',
            }}>
                {/* Floating glow orbs */}
                <div className="hero-glow-orb orb-1" />
                <div className="hero-glow-orb orb-2" />
                <div className="hero-glow-orb orb-3" />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                        {/* Left: Text Content */}
                        <div>
                            <div className="badge badge-lime" style={{ display: 'inline-flex', marginBottom: 28 }}>
                                <Zap size={14} /> Real-Time Quiz Platform
                            </div>

                            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
                                Quiz smarter.<br />
                                <span className="text-shimmer">Compete faster.</span>
                            </h1>

                            <p style={{
                                fontSize: '1.25rem', color: 'var(--text-muted)',
                                maxWidth: '90%', marginBottom: 40, lineHeight: 1.6
                            }}>
                                Host live quiz battles, answer in real-time, and watch the leaderboard erupt. Built for modern classrooms, remote teams, and global tournaments.
                            </p>

                            <div className="flex gap-16" style={{ flexWrap: 'wrap' }}>
                                <AnimatedButton to="/register" className="btn-lg">
                                    Start for free
                                    <span className="btn-arrow">→</span>
                                </AnimatedButton>
                                <Link to="/join" className="btn btn-ghost btn-lg flex items-center gap-8">
                                    <PlayCircle size={20} /> Join a quiz
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div style={{ marginTop: 40, display: 'flex', gap: 24, color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex' }}>
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--bg)', marginLeft: i > 1 ? -10 : 0, zIndex: 6 - i }}></div>)}
                                    </div>
                                    <span style={{ fontSize: '0.875rem' }}>Trusted by <strong>10,000+</strong> hosts</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: UI Mockup */}
                        <div className="animate-float" style={{ display: { xs: 'none', md: 'block' } }}>
                            <div className="browser-mockup" style={{ transform: 'rotate(-2deg) scale(0.95)' }}>
                                <div className="browser-header">
                                    <div className="browser-dot dot-red"></div>
                                    <div className="browser-dot dot-yellow"></div>
                                    <div className="browser-dot dot-green"></div>
                                </div>
                                <div style={{ padding: 24, background: 'var(--bg-deep)' }}>
                                    <div className="flex justify-between items-center mb-16">
                                        <h3 className="text-white-bright font-bold">Live Leaderboard</h3>
                                        <div className="badge badge-lime pulse">Live</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div className="leaderboard-row rank-1">
                                            <div className="rank-badge">1</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="text-white-bright font-bold">Alex Johnson</div>
                                                <div className="text-lime text-sm">4,250 pts</div>
                                            </div>
                                            <div className="badge badge-success">+950</div>
                                        </div>
                                        <div className="leaderboard-row rank-2">
                                            <div className="rank-badge">2</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="text-white-bright font-bold">Sarah Smith</div>
                                                <div className="text-gray-muted text-sm">3,800 pts</div>
                                            </div>
                                        </div>
                                        <div className="leaderboard-row rank-3">
                                            <div className="rank-badge">3</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="text-white-bright font-bold">Mike T.</div>
                                                <div className="text-gray-muted text-sm">3,450 pts</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Use Cases */}
            <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-deep)' }}>
                <div className="container text-center">
                    <p className="text-gray-muted text-sm font-bold tracking-wider uppercase mb-24" style={{ letterSpacing: '0.1em' }}>Powering interactive experiences for</p>
                    <div className="logo-cloud">
                        <div className="logo-item"><GraduationCap size={24} /> Education</div>
                        <div className="logo-item"><Building2 size={24} /> Corporate Retreats</div>
                        <div className="logo-item"><Users size={24} /> Communities</div>
                        <div className="logo-item"><Calendar size={24} /> Live Events</div>
                        <div className="logo-item"><Trophy size={24} /> Tournaments</div>
                    </div>
                </div>
            </section>

            {/* Product Demo Full Width */}
            <section style={{ padding: '120px 0', position: 'relative' }}>
                <div className="container text-center">
                    <h2 className="text-white-bright" style={{ fontSize: '2.5rem', marginBottom: 20 }}>Designed for speed and clarity</h2>
                    <p className="text-gray-muted" style={{ maxWidth: 600, margin: '0 auto 60px', fontSize: '1.1rem' }}>Manage your quizzes, monitor active sessions, and analyze player performance from a professional, distraction-free dashboard.</p>

                    <div className="browser-mockup" style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'left' }}>
                        <div className="browser-header">
                            <div className="browser-dot dot-red"></div>
                            <div className="browser-dot dot-yellow"></div>
                            <div className="browser-dot dot-green"></div>
                        </div>
                        <div style={{ padding: 40, background: 'var(--bg-deep)' }}>
                            <div className="flex justify-between items-center mb-32">
                                <h1 className="text-white-bright" style={{ fontSize: '2rem' }}>Host Dashboard</h1>
                                <AnimatedButton className="btn-sm">New Quiz</AnimatedButton>
                            </div>
                            <div className="grid-3 mb-32">
                                <div className="card" style={{ padding: 20 }}>
                                    <div className="text-gray-muted text-sm mb-8">Total Quizzes</div>
                                    <div className="text-lime text-xl font-bold">12</div>
                                </div>
                                <div className="card" style={{ padding: 20 }}>
                                    <div className="text-gray-muted text-sm mb-8">Total Players Hosted</div>
                                    <div className="text-lime text-xl font-bold">2,450</div>
                                </div>
                                <div className="card" style={{ padding: 20 }}>
                                    <div className="text-gray-muted text-sm mb-8">Active Sessions</div>
                                    <div className="text-lime text-xl font-bold">1</div>
                                </div>
                            </div>
                            <div className="card admin-table-row" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="text-white-bright font-bold text-lg">General Knowledge Championship '24</div>
                                    <div className="text-gray-subtle text-sm">20 Questions • 15s per question</div>
                                </div>
                                <div className="btn btn-ghost btn-sm">Host Match</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 0', background: 'var(--bg-deep)' }}>
                <div className="container">
                    <div className="text-center mb-60">
                        <div className="badge badge-muted mb-16">Features</div>
                        <h2 className="text-white-bright" style={{ fontSize: '2.5rem', marginBottom: 16 }}>
                            Everything you need to <span className="text-lime">run a great quiz</span>
                        </h2>
                        <p className="text-gray-muted" style={{ fontSize: '1.1rem' }}>
                            Powerful mechanics under the hood, beautiful design on the surface.
                        </p>
                    </div>

                    <div className="grid-2" style={{ maxWidth: 900, margin: '0 auto' }}>
                        {features.map(f => (
                            <div key={f.title} className="feature-card-modern">
                                <div className="feature-icon-wrapper">{f.icon}</div>
                                <h3 className="text-white-bright text-xl mb-8">{f.title}</h3>
                                <p className="text-gray-muted leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '120px 0' }}>
                <div className="container">
                    <h2 className="text-white-bright text-center" style={{ fontSize: '2.5rem', marginBottom: 60 }}>Loved by hosts worldwide</h2>
                    <div className="grid-3">
                        {testimonials.map((t, i) => (
                            <div key={i} className="card feature-card-modern" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: 4, color: 'var(--warning)', marginBottom: 16 }}>
                                    {'★★★★★'}
                                </div>
                                <p className="text-gray-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>"{t.text}"</p>
                                <div className="flex items-center gap-12">
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--lime)' }}>
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-white-bright font-medium text-sm">{t.name}</div>
                                        <div className="text-gray-subtle text-sm">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '120px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="hero-glow-orb orb-3" style={{ opacity: 0.1, top: '50%', left: '50%' }} />
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
                    <h2 className="text-white-bright" style={{ fontSize: '3rem', marginBottom: 20 }}>Ready to play?</h2>
                    <p className="text-gray-muted" style={{ marginBottom: 40, fontSize: '1.15rem' }}>
                        Join thousands of hosts creating engaging, real-time interactive experiences built on modern web technology.
                    </p>
                    <AnimatedButton to="/register" fullWidth className="btn-lg">
                        Create your first quiz free
                        <span className="btn-arrow">→</span>
                    </AnimatedButton>
                </div>
            </section>

            {/* Premium Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-deep)', paddingTop: 60, paddingBottom: 40 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 60 }}>
                        <div style={{ gridColumn: '1 / -1', maxWidth: 300 }}>
                            <Link to="/" style={{ textDecoration: 'none', color: 'var(--lime)', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Zap size={24} /> QuizBlitz
                            </Link>
                            <p className="text-gray-muted text-sm leading-relaxed mb-24">
                                The modern platform for real-time quizzes. Engage your audience with sub-second latency and beautiful design.
                            </p>
                            <div className="flex gap-16 text-gray-subtle">
                                <Twitter size={20} style={{ cursor: 'pointer' }} className="hover:text-lime transition" />
                                <Github size={20} style={{ cursor: 'pointer' }} className="hover:text-lime transition" />
                                <MapPin size={20} style={{ cursor: 'pointer' }} className="hover:text-lime transition" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white-bright font-bold mb-16">Product</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Features</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Pricing</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Leaderboards</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Changelog</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white-bright font-bold mb-16">Resources</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Documentation</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Help Center</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Community</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Blog</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white-bright font-bold mb-16">Company</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>About us</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Careers</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Privacy Policy</a>
                                <a href="#" className="text-gray-muted text-sm hover:text-white transition" style={{ textDecoration: 'none' }}>Terms of Service</a>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-subtle text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                        © 2026 QuizBlitz Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
