export default function LeaderboardRow({ rank, nickname, score, lastPoints, animate = true }) {
    const isTop3 = rank <= 3;
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return (
        <div className={`leaderboard-row rank-${rank}`} style={{ animationDelay: `${(rank - 1) * 0.07}s` }}>
            <div className="rank-badge">{isTop3 ? medals[rank] : rank}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{nickname}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif', color: 'var(--text)'" }}>
                    {score} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>pts</span>
                </div>
                {lastPoints > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--lime)', fontWeight: 600 }}>+{lastPoints}</div>
                )}
            </div>
        </div>
    );
}
